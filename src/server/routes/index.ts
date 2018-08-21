import { Router, Client } from '../core';
import { loadInstaller, enforceAjax, adminLogged } from '../middleware'
import { updateJsonFile } from '../core/fs';
import { join } from 'path';
import { emitter, Events } from '../core/Events'

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
Router.get(/\/media\/.+/, async (client, mongo) => {
  let file = await mongo.findFile(client.path)
  if (!file) return client.response.send404()
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
  return client.response.redirect.to('home')
})