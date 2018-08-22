import { Client } from '../core'

export async function csrf(client: Client) {
  await client.session.start()
  let csrf = client.headers.get('x-csrf-token', client.data.request('_csrf'))
  return client.session.csrf == csrf
}