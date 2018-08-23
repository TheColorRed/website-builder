import { Client } from '../core';

export function adminLogged(client: Client) {
  if (client.route.isPath(/^\/admin\/.+/)) {
    if (client.session.is('admin.email')) return true
  }
  if (client.ajax) return client.response.json({ error: true }, 403)
  return client.response.redirect.to('admin-login')
}