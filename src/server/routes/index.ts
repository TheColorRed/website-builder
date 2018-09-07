import { Router, Client } from '../core'
import { loadInstaller, enforceAjax } from '../middleware'
import { updateJsonFile } from '../core/fs'
import { join } from 'path'
import { emitter, Events } from '../core/Events'
import { MediaManager } from '../utils'
import { GridFSBucket, ObjectID } from 'mongodb'
import * as fs from 'fs'
import { tmpdir } from 'os'

////////////////////////////////////////////////////////////////////////////////
/// Webpage routes
////////////////////////////////////////////////////////////////////////////////
// Main webpage routes
Router.group('/', { middleware: [loadInstaller] }, () => require('./web'))
// Admin routes
Router.group('/admin', { middleware: [loadInstaller] }, () => require('./web-admin'))

////////////////////////////////////////////////////////////////////////////////
// Media routes
////////////////////////////////////////////////////////////////////////////////

// Gets files from the mongo database
// These are files that are not apart of the website builder
// Things such as movies/images/audio/etc.
Router.get(/^\/media\/.+/, async (client, mongo) => {
  let mediaManager = new MediaManager(mongo)
  let file = await mediaManager.findFile(client.path)
  if (!file) return client.response.sendErrorPage(404)

  // If a width/height is given ("?width=xxx"/"?w=xxx" or "?height=xxx"/"?h=xxx") resize the image
  let hasWidth = client.data.get('width', client.data.get('w', false))
  let hasHeight = client.data.get('height', client.data.get('h', false))
  if (file.metadata.type == 'image' && (hasWidth || hasHeight)) {
    let width = parseInt(client.data.get('width', client.data.get('w', 0)))
    let height = parseInt(client.data.get('height', client.data.get('h', 0)))
    let result = await mediaManager.downsizeImage(file, width, height)
    // Save the image to a buffer to later get output to the browser
    return client.response.setBuffer(result).setHeader('Content-Type', 'image/png')
  }
  return client.response.setMedia(file)
})

////////////////////////////////////////////////////////////////////////////////
/// Api routes
////////////////////////////////////////////////////////////////////////////////
// Main website api routes
Router.group('/api', { middleware: [enforceAjax, loadInstaller] }, () => require('./api'))
// Admin api routes
Router.group('/admin/api', { middleware: [enforceAjax, loadInstaller] }, () => require('./api-admin'))

// TODO: Remove before release
// This is for testing purposes so that the installer doesn't need to be run
// every time there is an update to the config files
Router.get('/activate', async (client: Client) => {
  await updateJsonFile(join(__dirname, '../resources/config/database/connection.json'), 'database', 'my-awesome-website')
  await updateJsonFile(join(__dirname, '../resources/config/status.json'), 'installed', true)
  emitter.emit(Events.UpdateAppStatus)
  emitter.emit(Events.UpdateMongoConnection)
  await new Promise(resolve => emitter.once(Events.MongoConnected, () => resolve()))
  return client.response.redirect.to('admin-login')
})