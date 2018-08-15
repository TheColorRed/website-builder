import { Router, render, response, Element } from '../util'

Router.get('pages@page').name('home')
Router.get('/save', 'pages@save')

Router.group('/install', () => {
  Router.get(() => render('/pages/installer')).name('install')
})

Router.group('/admin', () => {
  // Router.get('')
})