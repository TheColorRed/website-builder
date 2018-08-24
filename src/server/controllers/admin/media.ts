import { Client, Mongo } from '../../core'

export async function files(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate('fs.files', [
    { $sort: { uploadDate: -1 } },
    { $group: { _id: '$filename', id: { $first: '$_id' }, size: { $sum: '$length' }, files: { $sum: 1 } } },
    { $project: { _id: '$id', filename: '$_id', size: '$size', files: '$files' } }
  ])
  return client.response.render('admin', 'media', {
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
  return client.response.render('admin', 'media', {
    page: 'file-details',
    files: await files.toArray(),
    title: 'Media File'
  })
}

export async function filter(client: Client, mongo: Mongo) {
  let filter = client.data.post<string[]>('filter')
  let files = await mongo.aggregate('fs.files', [
    { $sort: { uploadDate: -1 } },
    { $match: { 'metadata.type': { $in: filter } } },
    { $group: { _id: '$filename', id: { $first: '$_id' }, size: { $sum: '$length' }, files: { $sum: 1 } } },
    { $project: { _id: '$id', filename: '$_id', size: '$size', files: '$files' } }
  ])
  return client.response.json(await files.toArray())
}