import { Client } from '../core'

export function forceAjax(client: Client) {
  if (client.ajax) return true
}