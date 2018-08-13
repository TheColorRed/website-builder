import { Router } from '../util'

Router.post('/install', 'install@install')
Router.post('/install/testMongoConnection', 'install@testConnection')