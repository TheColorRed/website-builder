import { Router, response } from '../core';
import { loadInstaller, forceAjax } from '../middleware'
import { updateAppStatus } from '../controllers/install'

// Web routes
Router.group('/', { middleware: [loadInstaller] }, () => require('./web'))

// Api routes
Router.group('/api', { middleware: [forceAjax, loadInstaller] }, () => require('./api'))

Router.get('/activate', async () => {
  await updateAppStatus()
  return response().redirect.to('home')
})