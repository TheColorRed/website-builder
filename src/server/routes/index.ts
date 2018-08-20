import { Router, response } from '../core';
import { loadInstaller, forceAjax } from '../middleware'
import { updateAppStatus } from '../controllers/install'

// Web routes
Router.group('/', { middleware: [loadInstaller] }, () => require('./web'))
Router.group('/admin', { middleware: [loadInstaller] }, () => require('./web-admin'))

// Api routes
Router.group('/api', { middleware: [forceAjax, loadInstaller] }, () => require('./api'))
Router.group('/admin/api', { middleware: [forceAjax, loadInstaller] }, () => require('./api-admin'))

Router.get('/activate', async () => {
  await updateAppStatus()
  return response().redirect.to('home')
})