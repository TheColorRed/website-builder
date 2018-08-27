import { GridFSBucket, ObjectID } from 'mongodb'
import * as fs from 'fs'
import * as mime from 'mime-types'
import { Mongo, MediaObject } from '../core';

export interface MediaFile {
  _id: ObjectID
  length: number
  chunkSize: number
  uploadDate: Date
  filename: string
  md5: string
}

export interface MediaChunk {
  _id: ObjectID
  files_id: ObjectID
  n: number
  data: any
}

export interface MediaTrash {
  _id: ObjectID
  collection: string
  ttl: Date
  restore_id: ObjectID
  data: MediaFile | MediaChunk
}

export class MediaManager {


  public constructor(private mongo: Mongo) { }

  public async saveFile(sourcePath: string, filePath: string) {
    return new Promise<{ error: boolean, message: string }>(resolve => {
      let grid = new GridFSBucket(this.mongo.db)
      let mimeType = mime.lookup(filePath) || ''
      fs.createReadStream(sourcePath)
        .pipe(grid.openUploadStream(filePath, {
          metadata: {
            mime: mimeType,
            type: mimeType.split('/')[0] || 'unknown',
            ext: mimeType.split('/')[1] || 'unknown'
          }
        }))
        .on('error', (err) => resolve({ error: true, message: err.message }))
        .on('finish', () => resolve({ error: false, message: '' }))
    })
  }

  public async deleteFile(id: ObjectID | string): Promise<void> {
    let objectId: ObjectID = typeof id == 'string' ? new ObjectID(id) : id
    let grid = new GridFSBucket(this.mongo.db)
    await grid.delete(objectId)
  }

  public async findFile(filePath: string) {
    let files = await this.mongo.aggregate<MediaObject>('fs.files', [
      { $match: { filename: filePath } },
      { $sort: { uploadDate: -1 } },
      { $limit: 1 }
    ])
    return await files.next()
  }

  public async moveToTrash(id: ObjectID) {
    let item = await this.mongo.select('fs.files', { _id: id }, 1)
    if (!item) return false
    let ttl = new Date()
    let restoreId = new ObjectID()
    let chunks = await this.mongo.select<{ _id: ObjectID }>('fs.chunks', { files_id: id })
    let bulk = this.mongo.db.collection('trash').initializeUnorderedBulkOp()
    if (await chunks.count() > 0) {
      let chunk = await chunks.next()
      let ids: ObjectID[] = []
      while (chunk) {
        bulk.insert({ collection: 'fs.chunks', ttl, restore_id: restoreId, data: chunk })
        ids.push(chunk._id)
        chunk = await chunks.next()
      }
      let ok = !!(await bulk.execute()).ok
      if (ok) {
        await this.mongo.delete('fs.chunks', { _id: { $in: ids } })
        await this.mongo.insert('trash', { collection: 'fs.files', ttl, restore_id: restoreId, data: item })
        await this.mongo.delete('fs.files', { _id: id }, 1)
      }
      return ok
    }
    return false
  }

  public async restoreFromTrash(id: ObjectID) {
    // let items = await this.mongo.select<MediaTrash>('trash', {
    //   $or: [{
    //     collection: 'fs.files', 'data._id': id
    //   }, {
    //     collection: 'fs.chunks', 'data.files_id': id
    //   }]
    // })
    let items = await this.mongo.select<MediaTrash>('trash', { restore_id: id })
    if (await items.count() > 0) {
      let bulkChunks = this.mongo.db.collection('fs.chunks').initializeUnorderedBulkOp()
      let ids: ObjectID[] = []
      let item = await items.next()
      while (item) {
        if (item.collection == 'fs.chunks') {
          bulkChunks.insert(item.data)
          ids.push(item._id)
        } else {
          await this.mongo.insert(item.collection, item.data)
          await this.mongo.delete('trash', { _id: item._id })
        }
        item = await items.next()
      }
      let ok = !!(await bulkChunks.execute()).ok
      if (ok) {
        await this.mongo.delete('trash', { _id: { $in: ids } })
      }
      return ok
    }
    return false
  }
}