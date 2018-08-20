import { Router, render } from '../core'

////////////////////////////////////////////////////////////////////////////////
/// Admin web interface
/// Prefix: /admin
////////////////////////////////////////////////////////////////////////////////

Router.get('/login', () => render('/pages/admin/login')).name('admin-login')

Router.group('/install', () => {
  Router.get(() => render('/pages/installer')).name('install')
})