import { Client } from '../core'

export async function startSession(client: Client) {
  await client.session.start()
  await client.session.setTTL(604800)
  return true
}