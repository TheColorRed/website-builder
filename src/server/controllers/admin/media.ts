import { Client, Mongo } from '../../core'
import { MediaManager } from '../../utils'
import { unixJoin } from '../../core/fs'
import { MediaFile } from '../../models'
import { directories, files, MediaFilter } from '../../services/Media'

export async function main(client: Client, mongo: Mongo) {
  let path = client.data.request<string>('path', '/media')
  let dir = await directories(mongo, path)
  let dirFiles = await files(mongo, path)
  let result: any = {
    directories: await dir.toArray(),
    files: await dirFiles.toArray()
  }

  // Return ajax response
  if (client.ajax) {
    return client.response.json(result)
  }

  // Return non-ajax response
  result.page = 'file-list'
  result.title = 'Media File Manager'
  return client.response.render('admin', 'file-list', result)
}

export async function file(client: Client, mongo: Mongo) {
  let files = await mongo.aggregate<MediaFile>('fs.files', [
    { $match: { filename: mongo.sanitize(client.data.get('file')) } },
    { $sort: { uploadDate: -1 } }
  ])
  let crumbs = client.data.get<string>('file').split('/')
  return client.response.render('admin', 'file-details', {
    page: 'file-details',
    files: await files.toArray(),
    title: 'Media File',
    back: crumbs.slice(0, crumbs.length - 1).join('/')
  })
}

export async function filter(client: Client, mongo: Mongo) {
  let filter = client.data.request<MediaFilter>('filter')
  let dirFiles = await files(mongo, filter.path, filter)
  // let files = await mongo.aggregate<MediaObject>('fs.files', [
  //   { $sort: { uploadDate: -1 } },
  //   { $match: { 'metadata.type': { $in: mongo.sanitize(client.data.post<string[]>('filter')) } } },
  //   {
  //     $group: {
  //       _id: '$filename',
  //       id: { $first: '$_id' },
  //       size: { $sum: '$length' },
  //       files: { $sum: 1 },
  //       metadata: { $first: '$metadata' },
  //       uploadDate: { $first: '$uploadDate' }
  //     }
  //   },
  //   { $addFields: { _id: '$id', filename: '$_id' } },
  //   { $project: { id: 0 } }
  // ])
  return client.response.json(await dirFiles.toArray())
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