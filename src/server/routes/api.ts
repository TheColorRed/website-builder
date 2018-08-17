import { Router } from '../core'

Router.group('/install', () => {
  Router.post('install@install')
  Router.post('/testMongoConnection', 'install@testConnection')
})