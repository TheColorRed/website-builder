import { Router } from '../core'
import { startSession } from '../middleware';

////////////////////////////////////////////////////////////////////////////////
/// Admin API
/// Prefix: /admin/api
////////////////////////////////////////////////////////////////////////////////

Router.post('/login', { middleware: [startSession] }, 'admin@login').name('api-admin-login')

Router.group('/install', () => {
  Router.post('install@install').name('api-admin-install')
  Router.post('/testMongoConnection', 'install@testConnection').name('api-admin-test-mongo')
})