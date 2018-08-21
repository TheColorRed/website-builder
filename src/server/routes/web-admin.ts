import { Router } from '../core'
import { adminLogged, startSession } from '../middleware';

////////////////////////////////////////////////////////////////////////////////
/// Admin web interface
/// Prefix: /admin
////////////////////////////////////////////////////////////////////////////////

Router.get('/login', (client) => client.response.render('/pages/admin/login')).name('admin-login')

Router.group('/install', () => {
  Router.get((client) => client.response.render('/pages/installer')).name('install')
})

Router.group('/', { middleware: [startSession, adminLogged] }, () => {
  Router.get('/home', (client) => client.response.render('/pages/admin/home')).name('admin-home')
})