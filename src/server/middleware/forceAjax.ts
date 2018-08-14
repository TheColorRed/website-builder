import { Client } from '../util'

export function forceAjax(client: Client) {
  if (client.ajax) return true
}