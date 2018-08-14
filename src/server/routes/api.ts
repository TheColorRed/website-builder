import { Router } from '../util'

Router.group('/install', () => {
  Router.post('install@install')
  Router.post('/testMongoConnection', 'install@testConnection')
})