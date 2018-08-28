import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs'
import { ReadStream, Stats } from 'fs'
import * as path from 'path'
import { emitter, Events } from './core/Events'
import { Client, Router, AppStatus, Response } from './core'
import { Mongo, MongoConnectionInfo, mongoClient, setClient } from './core/Mongo'
import { readJson } from './core/fs'
import { GridFSBucket, ObjectID } from 'mongodb'

/** @type {number} The port the app will listen on */
const APP_PORT: number = 3030
/** @type {string} The path to the mongodb configuration file */
const MONGO_CONN_CONFIG: string = path.join(__dirname, './resources/config/database/connection.json')

let appStatus: AppStatus

let server = http.createServer((req, res) => {
  // Get the info about the request
  let urlInfo = url.parse('http://' + req.headers.host + (req.url || '/'))

  function send(response: Response): void {
    let fileSize = response.contentLength
    let start = 0, end = fileSize - 1
    // If the file is larger than 5,000,000 bytes
    // then send the file in chunks
    if (fileSize > 5e6) {
      let range = (req.headers.range || '') as string
      let positions = range.replace(/bytes=/, '').split('-')
      start = parseInt(positions[0], 10)
      end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1
      let chunkSize = (end - start) + 1
      response.setCode(206).setHeaders({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Connection': 'Keep-Alive',
        'Content-Length': chunkSize
      })
    }
    res.writeHead(response.code, response.headers)
    if (response.filePath) {
      let stream: ReadStream = fs.createReadStream(response.filePath, { start, end })
        .on('open', () => stream.pipe(res))
        .on('close', () => res.end())
        .on('error', err => res.end(err))
    } else if (response.media) {
      let grid = new GridFSBucket(mongoClient.db)
      grid.openDownloadStream(new ObjectID(response.media._id), { start, end })
        .on('data', (chunk: string | Buffer) => res.write(chunk))
        .on('end', () => res.end())
        .on('error', (err: any) => res.end(err))
    } else {
      res.write(response.body)
      res.end()
    }
  }

  let body = ''
  req
    // Build the body
    .on('data', (data: Buffer) => {
      body += data.toString('binary')
      // Kill the request if it is larger than 2000000 bytes (approximately 2MB)
      if (body.length > 2e6) req.connection.destroy()
    })
    // Once all the data has been received start responding to the request
    .on('end', async (data: Buffer) => {
      if (data) body += data.toString('binary')
      // Create a new client
      let client = new Client(req, body, appStatus)

      // Test if a path exists in the public folder
      // and if it does send the file to end the request
      if (urlInfo.pathname) {
        let filePath = path.join(__dirname, '../public', urlInfo.pathname)
        try {
          let stats = await new Promise<Stats>(resolve => fs.stat(filePath, (err, stat) => resolve(stat)))
          if (stats.isFile()) {
            let resp = client.response.setFile(filePath).setContentLength(stats.size)
            return send(resp)
          }
        } catch (e) { }
      }

      // If the static file doesn't exist try sending the request through the router
      // If the route was found send the response otherwise send a 404
      let resp = await Router.route(urlInfo, client, mongoClient)
      await client.session.close()
      if (!resp) send(client.response.sendErrorPage(404))
      else send(resp)
    })
}).listen(APP_PORT, async () => {
  console.log('Started listening on port ' + APP_PORT)
  // Get the current application status
  await getAppStatus()
  // Try connecting to the database
  await attemptDatabaseConnection()
  // Load the routes
  console.log('Loading the application routes')
  require('./routes')
  console.log('Application ready!')
})

process.on('SIGINT', () => {
  console.warn('Application shutting down')
  server.close(async (err: any) => {
    if (err) {
      console.error(err)
      process.exit(1)
    } else {
      if (mongoClient) await mongoClient.close()
      process.exit(0)
    }
  })
}).on('message', () => console.log('here'))

emitter.on(Events.UpdateMongoConnection, async () => {
  await attemptDatabaseConnection()
  emitter.emit(Events.MongoConnected)
})

emitter.on(Events.UpdateAppStatus, async () => {
  await getAppStatus()
})

/**
 * Attempt to connect to the database
 *
 */
async function attemptDatabaseConnection() {
  let connection = await readJson<MongoConnectionInfo>(MONGO_CONN_CONFIG)
  console.log('Attempting to connect to the database')
  try {
    let mongo = await Mongo.connect(connection)
    setClient(mongo)
    console.log('Database connection successful')
  } catch (e) {
    console.error('Database connection failed')
  }
}

async function getAppStatus() {
  console.log('Updating the application status')
  appStatus = await readJson<AppStatus>(path.join(__dirname, './resources/config/status.json'))
}
