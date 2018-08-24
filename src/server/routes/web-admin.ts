import { Router } from '../core'
import { adminLogged, startSession } from '../middleware';

////////////////////////////////////////////////////////////////////////////////
/// Admin web interface
/// Prefix: /admin
////////////////////////////////////////////////////////////////////////////////

Router.get('/login', (client) => client.response.render('admin', 'login')).name('admin-login')


Router.group('/install', () => {
  Router.get((client) => client.response.render('admin', 'installer')).name('install')
})

Router.group('/', { middleware: [startSession, adminLogged] }, () => {
  Router.get('/home', (client) => client.response.render('admin', 'home')).name('admin-home')
  Router.get('/media', 'admin/media@files').name('admin-media')
  Router.get('/media/file', 'admin/media@file').name('admin-media-file')
  Router.get('/trash', 'admin/trash').name('admin-trash')
  Router.get('/logout', 'admin@logout').name('admin-logout')
})