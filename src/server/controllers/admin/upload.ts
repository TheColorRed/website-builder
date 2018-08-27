import { Client } from '../../core';

export async function main(client: Client) {
  return client.response.render('admin', 'upload')
}