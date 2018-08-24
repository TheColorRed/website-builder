import { Router } from '../core'
import { startSession, adminLogged, csrf } from '../middleware';

////////////////////////////////////////////////////////////////////////////////
/// Admin API
/// Prefix: /admin/api
////////////////////////////////////////////////////////////////////////////////

Router.post('/login', { middleware: [startSession] }, 'admin@login').name('api-admin-login')

Router.group('/install', () => {
  Router.post('admin/install').name('api-admin-install')
  Router.post('/testMongoConnection', 'install@testConnection').name('api-admin-test-mongo')
})

Router.group('/', { middleware: [startSession, adminLogged, csrf] }, () => {
  Router.post('/media/delete', 'admin/trash@moveToTrash').name('api-admin-delete-media')
  Router.post('/media/restore', 'admin/trash@restoreFromTrash').name('api-admin-restore-media')
  Router.post('/media/filter', 'admin/media@filter').name('api-admin-filter-media')
})