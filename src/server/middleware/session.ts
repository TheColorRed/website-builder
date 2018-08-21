import { Client } from '../core'

export async function startSession(client: Client) {
  await client.session.start()
  return true
}