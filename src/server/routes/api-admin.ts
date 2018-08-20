import { Router, render } from '../core'

////////////////////////////////////////////////////////////////////////////////
/// Admin API
/// Prefix: /admin/api
////////////////////////////////////////////////////////////////////////////////

Router.get('/login', () => render('/pages/admin/login'))

Router.group('/install', () => {
  Router.post('install@install').name('api-admin-install')
  Router.post('/testMongoConnection', 'install@testConnection').name('api-admin-test-mongo')
})