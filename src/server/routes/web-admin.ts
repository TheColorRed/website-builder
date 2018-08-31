import { Router } from '../core'
import { adminLogged, startSession } from '../middleware';
import { MediaManager } from '../utils';
import { ObjectID } from 'bson';
import { MediaFile } from '../models';

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
  Router.get('/pages', 'admin/pages').name('admin-pages')
  Router.get('/media', 'admin/media').name('admin-media')
  Router.get('/media/file', 'admin/media@file').name('admin-media-file')
  Router.get('/trash', 'admin/trash').name('admin-trash')
  Router.get('/upload', 'admin/upload').name('admin-upload')
  Router.get('/logout', 'admin@logout').name('admin-logout')

  Router.get('/media/view/:id', async (client, mongo) => {
    let mediaManager = new MediaManager(mongo)
    let file = await mediaManager.findFileById(new ObjectID(client.route.params.id))
    if (!file) return client.response.sendErrorPage(404)
    return client.response.setMedia(file)
  })
})