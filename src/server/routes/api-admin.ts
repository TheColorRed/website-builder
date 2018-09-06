import { Router, Route, Client } from '../core'
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
  Router.post('/media/filter', 'admin/media@filter').name('api-admin-filter-media')
  Router.post('/media/upload', 'admin/media@upload').name('api-admin-upload-media')
  Router.get('/media/files', 'admin/media').name('api-admin-media-files')
  Router.get('/media/file', 'admin/media@file').name('api-admin-media-file')

  Router.get('/trash', 'admin/trash').name('api-admin-trash')
  Router.post('/media/trash/restore', 'admin/trash@restoreFromTrash').name('api-admin-restore-media')
  Router.post('/media/trash/purge', 'admin/trash@restoreFromTrash').name('api-admin-purge-media')

  Router.get('/pages', 'admin/pages@pages').name('api-admin-pages')

  Router.group('/routes', () => {
    Router.get('/list', (client: Client) => {
      let routes = Router.routes
        .filter(r => typeof r.path == 'string' && r.path.startsWith('/admin'))
        .map(r => Object.assign({ path: r.path, name: r.routeName }))
      return client.response.json(routes)
    }).name('api-admin-route-list')
  })
})