import { Router, Client } from '../util'

function forceAjax(client: Client) {
  if (client.ajax) return true
}

Router.group('/install', { middleware: [forceAjax] }, async () => {
  Router.post('/', 'install@install')
  Router.post('/testMongoConnection', 'install@testConnection')
})