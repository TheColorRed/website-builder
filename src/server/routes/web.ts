import { Router, render, response, Element, MediaObject } from '../core'

Router.get('pages@page').name('home')
Router.get('/save', 'pages@save')

Router.get(/\/media\/.+/, async (client, mongo) => {
  let file = await mongo.findFile(client.path)
  if (!file) return response().send404()
  return response().setMedia(file)
})

Router.group('/admin', () => {
  // Router.get('')
})

Router.group('/install', () => {
  Router.get(() => render('/pages/installer')).name('install')
})