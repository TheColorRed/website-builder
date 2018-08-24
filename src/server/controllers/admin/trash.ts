import { Client, Mongo } from '../../core'
import { MediaTrash, MediaManager } from '../../utils';
import { ObjectID } from 'bson';

export async function main(client: Client, mongo: Mongo) {
  let files = await mongo.select<MediaTrash>('trash', { collection: 'fs.files' })
  return client.response.render('admin', 'trash', {
    page: 'file-details',
    files: await files.toArray(),
    title: 'Trash'
  })
}

export async function moveToTrash(client: Client, mongo: Mongo) {
  let id = client.data.post('id')
  if (!id) return client.response.json({ error: true, message: 'Invalid id' })
  let media = new MediaManager(mongo)
  let ok = await media.moveToTrash(new ObjectID(id))
  return client.response.json({ error: !ok })
}

export async function restoreFromTrash(client: Client, mongo: Mongo) {
  let id = client.data.post('id')
  if (!id) return client.response.json({ error: true, message: 'Invalid id' })
  let media = new MediaManager(mongo)
  let ok = await media.restoreFromTrash(new ObjectID(id))
  return client.response.json({ error: !ok })
}