import { Client, Mongo } from '../../core'
import { MediaManager } from '../../utils';
import { ObjectID } from 'bson';
import { MediaTrash } from '../../models';

export async function main(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate<MediaTrash>('trash', [{ $match: { collection: 'fs.files' } }, { $sort: { deleteDate: -1 } }])
  return client.response.render('admin', 'trash', {
    page: 'file-details',
    files: await files.toArray(),
    title: 'Trash'
  })
}

export async function moveToTrash(client: Client, mongo: Mongo) {
  let id = client.data.post<string>('id')
  if (!id) return client.response.json({ error: true, message: 'Invalid id' })
  let media = new MediaManager(mongo)
  let ok = await media.moveToTrash(new ObjectID(id))
  return client.response.json({ error: !ok })
}

export async function restoreFromTrash(client: Client, mongo: Mongo) {
  let id = client.data.post<string>('id')
  if (!id) return client.response.json({ error: true, message: 'Invalid id' })
  let media = new MediaManager(mongo)
  let ok = await media.restoreFromTrash(new ObjectID(id))
  return client.response.json({ error: !ok })
}