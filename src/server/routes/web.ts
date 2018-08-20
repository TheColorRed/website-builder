import { Router, render, response } from '../core'

Router.get('pages@page').name('home')
Router.get('/save', 'pages@save')

Router.get(/\/media\/.+/, async (client, mongo) => {
  let file = await mongo.findFile(client.path)
  if (!file) return response().send404()
  return response().setMedia(file)
})