import { Client, Mongo } from '../../core'

export async function files(client: Client, mongo: Mongo) {
  // let files = await mongo.select('fs.files', { $group: { filename: 1 } })
  let files = await mongo.aggregate('fs.files', [
    { $sort: { uploadDate: -1 } },
    { $group: { _id: '$filename', id: { $first: '$_id' } } },
    { $project: { _id: '$id', filename: '$_id' } }
  ])
  return client.response.render('/pages/admin/media', {
    files: await files.toArray(),
    title: 'Media File Manager'
  })
}