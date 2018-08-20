import { Client } from '../core'

export function enforceAjax(client: Client) {
  if (client.ajax) return true
}