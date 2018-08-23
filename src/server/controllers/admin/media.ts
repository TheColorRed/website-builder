import { Client, Mongo } from '../../core'
import { ObjectID } from 'bson';
import { MediaManager } from '../../utils';

export async function files(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate('fs.files', [
    { $sort: { uploadDate: -1 } },
    { $group: { _id: '$filename', id: { $first: '$_id' } } },
    { $project: { _id: '$id', filename: '$_id' } }
  ])
  return client.response.render('/pages/admin/media', {
    page: 'file-list',
    files: await files.toArray(),
    title: 'Media File Manager'
  })
}

export async function file(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate('fs.files', [
    { $match: { filename: client.data.get('file') } },
    { $sort: { uploadDate: -1 } }
  ])
  return client.response.render('/pages/admin/media', {
    page: 'file-details',
    files: await files.toArray(),
    title: 'Media File'
  })
}
