import * as path from 'path'
import { Client, response, render } from '../core'
import { Mongo } from '../core/Mongo'
import { createHomePage } from './install'

export async function page(client: Client, mongo: Mongo) {
  let page = { title: '', header: '', main: '', footer: '', theme: '' }
  let settings = await mongo.settings()

  page.theme = settings.get('website-theme', '/css/themes/default.css')
  page.title = settings.get('website-title', 'My Website')
  page.main = await mongo.renderPage(client.route.path, {
    settings,
    data: client.data.toObject(),
    params: client.route.params
  })
  return render('/pages/main', page)
}

export async function save(client: Client, mongo: Mongo) {
  await createHomePage(mongo)
  await mongo.saveFile(path.join(__dirname, '../../media-backup/bbb.mp4'), '/media/bbb.mp4')
  return response().json('done')
}