import * as path from 'path'
import { Router } from '../util'

Router.get('/install', (client) => {
  try {
    return client.pug(path.join(__dirname, '../resources/views/pages/installer.pug'))
  } catch (e) {
    return client.redirect('/')
  }
})