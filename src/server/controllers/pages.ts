import { render, Client, response } from '../util'
import { Mongo } from '../util/Mongo'
import { createHomePage } from './install';

export async function page(client: Client, mongo: Mongo) {
  let page = { title: '', header: '', main: '', footer: '' }
  let settings = await mongo.settings()

  page.title = await mongo.setting<string>('website-title')
  page.main = await mongo.renderPage(client.route.path, { settings })
  return render('/pages/main', page)
}

export async function save(client: Client, mongo: Mongo) {
  await createHomePage(mongo)
  return response().json('done')
}