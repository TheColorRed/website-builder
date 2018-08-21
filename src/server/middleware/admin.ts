import { Client } from '../core';

export function adminLogged(client: Client) {
  if (client.route.isPath(/^\/admin\/.+/)) {
    if (client.session.is('admin.email')) return true
  }
  return client.response.redirect.to('admin-login')
}