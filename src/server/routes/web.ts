import { Router, render } from '../util'

Router.get((client, mongo) => {
  return render('/pages/home', { title: 'monkey' })
}).name('home')

Router.group('/install', () => {
  Router.get(() => render('/pages/installer')).name('install')
})

Router.group('/admin', () => {
  // Router.get('')
})