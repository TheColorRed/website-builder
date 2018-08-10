import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs'
import * as path from 'path'
import { Client, Router } from './util'
import * as mime from 'mime-types'
import { emitter } from './util/Events';
import { Mongo, MongoConnectionInfo } from './util/Mongo';

const port = 3030

import './routes'
import { readJson } from './util/fs';

let mongoClient: Mongo

emitter.on('update-mongo-connection', async () => {
  let connection = await readJson<MongoConnectionInfo>(path.join(__dirname, './resources/config/database/connection.json'))
  try {
    mongoClient = await Mongo.connect(connection)
  } catch (e) { }
})

http.createServer((req, res) => {
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
      readJson<{ installed: boolean }>(path.join(__dirname, './resources/config/status.json')).then(async status => {
        // Create a new client
        let client = new Client(req, res, body)

        // Test if a path exists in the public folder
        // If it does, send the file to the user and exit
        if (urlInfo.pathname) {
          let filePath = path.join(__dirname, '../public', urlInfo.pathname)
          try {
            let stat = fs.statSync(filePath)
            if (stat.isFile()) {
              let type = mime.lookup(filePath) || 'text/plain'
              return client.write(client.file(filePath).setHeader('Content-Type', type))
            }
          } catch (e) { }
        }

        // If the website hasn't been installed yet
        // Redirect to the install page at "/install"
        if (!status.installed && client.path != '/install') {
          return client.write(client.redirect('/install'))
        }

        // If the static file doesn't exist
        // Try sending the request through the router
        // If the route was found send the response
        // Otherwise send a 404
        let response = await Router.route(urlInfo, client, mongoClient)
        if (!response) client.send404()
        else client.write(response)
      })
    })
}).listen(port, () => console.log('Listening on port ' + port))