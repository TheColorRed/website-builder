import * as http from 'http'
import { IncomingMessage, ServerResponse } from 'http'
import * as url from 'url'
import * as fs from 'fs'
import * as path from 'path'
import * as mime from 'mime-types'
import { emitter } from './util/Events'
import { Client, Router, response, AppStatus, Response } from './util'
import { Mongo, MongoConnectionInfo } from './util/Mongo'
import { readJson } from './util/fs'

/** @type {number} The port the app will listen on */
const APP_PORT: number = 3030
/** @type {string} The path to the mongodb configuration file */
const MONGO_CONN_CONFIG: string = path.join(__dirname, './resources/config/database/connection.json')

let mongoClient: Mongo
let appStatus: AppStatus

let server = http.createServer((req, res) => {
  // Get the info about the request
  let urlInfo = url.parse('http://' + req.headers.host + (req.url || '/'))

  let body = ''
  req
    // Build the body
    .on('data', data => {
      body += data
      // Kill the request if it is larger than 2000000 bytes (approximately 2MB)
      if (body.length > 2e6) req.connection.destroy()
    })
    // Once all the data has been received start responding to the request
    .on('end', async () => {
      // Create a new client
      let client = new Client(req, res, body, appStatus)

      // Test if a path exists in the public folder
      // and if it does send the file and end the request
      if (urlInfo.pathname) {
        let filePath = path.join(__dirname, '../public', urlInfo.pathname)
        try {
          let stat = await new Promise<fs.Stats>(resolve => fs.stat(filePath, (err, stat) => resolve(stat)))
          // console.log(2e6)
          // console.log(stat.size, filePath)
          if (stat.isFile()) return stream(req, res, filePath, stat)
        } catch (e) { }
      }

      // If the static file doesn't exist try sending the request through the router
      // If the route was found send the response otherwise send a 404
      let resp = await Router.route(urlInfo, client, mongoClient)
      if (!resp) write(res, response().send404())
      else write(res, resp)
    })
}).listen(APP_PORT, async () => {
  console.log('Started listening on port ' + APP_PORT)
  // Get the current application status
  await getAppStatus()
  // Try connecting to the database
  await databaseConnectionAttempt()
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


emitter.on('update-mongo-connection', async () => {
  await databaseConnectionAttempt()
})

emitter.on('update-app-status', async () => {
  await getAppStatus()
})

/**
 * Attempt to connect to the database
 *
 */
async function databaseConnectionAttempt() {
  let connection = await readJson<MongoConnectionInfo>(MONGO_CONN_CONFIG)
  try {
    console.log('Attempting to connect to the database')
    mongoClient = await Mongo.connect(connection)
    console.log('Database connection successful')
  } catch (e) {
    console.error('Database connection failed')
  }
}

async function getAppStatus() {
  console.log('Updating the application status')
  appStatus = await readJson<AppStatus>(path.join(__dirname, './resources/config/status.json'))
}


function write(res: http.ServerResponse, response: Response) {
  res.writeHead(response.code, response.headers)
  res.write(response.body)
  res.end()
}

function stream(req: IncomingMessage, res: ServerResponse, filePath: string, stats: fs.Stats) {
  let total = stats.size
  let contentType = mime.lookup(filePath) || 'application/octet-stream'
  let start = 0, end = total - 1
  if (total < 2e6) {
    res.writeHead(200, { 'Content-Type': contentType })
  } else {
    let range = req.headers.range as string
    let positions = range.replace(/bytes=/, '').split('-')
    start = parseInt(positions[0], 10)
    end = positions[1] ? parseInt(positions[1], 10) : total - 1
    let chunkSize = (end - start) + 1
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType
    })
  }
  let stream = fs.createReadStream(filePath, { start, end })
    .on('open', function () {
      stream.pipe(res)
    }).on('error', function (err) {
      res.end(err)
    })
}