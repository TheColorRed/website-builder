import { Client, Mongo } from '../../core'
import { MediaManager } from '../../utils'
import { unixJoin } from '../../core/fs'
import { MediaObject } from '../../models'

export async function files(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate<MediaObject>('fs.files', [
    { $sort: { uploadDate: -1 } },
    { $group: { _id: '$filename', id: { $first: '$_id' }, size: { $sum: '$length' }, files: { $sum: 1 } } },
    { $addFields: { _id: '$id', filename: '$_id' } },
    { $sort: { filename: 1 } }
  ])
  return client.response.render('admin', 'media', {
    page: 'file-list',
    files: await files.toArray(),
    title: 'Media File Manager'
  })
}

export async function file(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate<MediaObject>('fs.files', [
    { $match: { filename: mongo.sanitize(client.data.get('file')) } },
    { $sort: { uploadDate: -1 } }
  ])
  return client.response.render('admin', 'media', {
    page: 'file-details',
    files: await files.toArray(),
    title: 'Media File'
  })
}

export async function filter(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate<MediaObject>('fs.files', [
    { $sort: { uploadDate: -1 } },
    { $match: { 'metadata.type': { $in: mongo.sanitize(client.data.post<string[]>('filter')) } } },
    { $group: { _id: '$filename', id: { $first: '$_id' }, size: { $sum: '$length' }, files: { $sum: 1 }, metadata: '$metadata', uploadDate: '$uploadDate' } },
    { $addFields: { _id: '$id', filename: '$_id' } },
    { $project: { id: 0 } }
  ])
  return client.response.json(await files.toArray())
}

export async function upload(client: Client, mongo: Mongo) {
  let file = client.data.files('file')
  let result = { error: true }
  if (file) {
    let mediaManager = new MediaManager(mongo)
    let path = client.data.post<string>('path', '/')
    result = await mediaManager.saveFile(file.tmpFilename, unixJoin('/media/', path, file.filename))
  }
  return client.response.json(result)
}