import { Router } from '../core'

Router.get('pages@page').name('home')
Router.get('/save', 'pages@save')