import { GridFSBucket, ObjectID } from 'mongodb'
import * as fs from 'fs'
import * as mime from 'mime-types'
import { Mongo } from '../core';
import { MediaFile, MediaTrash } from '../models';

export class MediaManager {

  public constructor(private mongo: Mongo, private bulkSize: number = 10) { }

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
    let files = await this.mongo.aggregate<MediaFile>('fs.files', [
      { $match: { filename: filePath } },
      { $sort: { uploadDate: -1 } },
      { $limit: 1 }
    ])
    return await files.next()
  }

  public async findFileById(id: ObjectID) {
    return await this.mongo.select<MediaFile>('fs.files', { _id: id }, 1)
  }

  public async moveFilesToTrash(filename: string) {
    let items = await this.mongo.select<MediaFile>('fs.files', { filename })
    let next
    while (next = await items.next()) {
      await this.moveToTrash(next._id as ObjectID)
    }
    return true
  }

  public async moveDirectoryToTrash(directory: string) {
    console.log(directory)
    let items = await this.mongo.select<MediaFile>('fs.files', { filename: RegExp(`^${directory}`) })
    let next
    while (next = await items.next()) {
      await this.moveToTrash(next._id as ObjectID)
    }
    return true
  }

  public async moveToTrash(id: ObjectID) {
    let item = await this.mongo.select<MediaFile>('fs.files', { _id: id }, 1)
    if (!item) return false
    let ttl = new Date()
    let restoreId = new ObjectID()
    let chunks = await this.mongo.select<{ _id: ObjectID }>('fs.chunks', { files_id: id })
    let bulk = this.mongo.unorderedBulk('trash')
    if (await chunks.count() > 0) {
      let ids: ObjectID[] = []
      let i = 1
      let ok = false
      let chunk
      // let chunkCount = Math.round(item.length / (item.chunkSize || 0))
      while (chunk = await chunks.next()) {
        let deleteDate = new Date()
        bulk.insert({ collection: 'fs.chunks', deleteDate, ttl, restore_id: restoreId, data: chunk })
        ids.push(chunk._id)
        if (i % this.bulkSize == 0 && bulk.length > 0) {
          ok = !!(await bulk.execute()).ok
          bulk = this.mongo.unorderedBulk('trash')
        }
        i++
      }
      if (bulk.length > 0) ok = !!(await bulk.execute()).ok
      if (ok) {
        let deleteDate = new Date()
        await this.mongo.delete('fs.chunks', { _id: { $in: ids } })
        await this.mongo.insert('trash', { collection: 'fs.files', deleteDate, ttl, restore_id: restoreId, data: item })
        await this.mongo.delete('fs.files', { _id: id }, 1)
      }
      return ok
    }
    return false
  }

  public async restoreFromTrash(id: ObjectID) {
    let items = await this.mongo.select<MediaTrash>('trash', { restore_id: id })
    if (await items.count() > 0) {
      let bulkChunks = this.mongo.unorderedBulk('fs.chunks')
      let ids: ObjectID[] = []
      let item = await items.next()
      let i = 1
      let ok = false
      while (item) {
        if (item.collection == 'fs.chunks') {
          bulkChunks.insert(item.data)
          if (i % this.bulkSize == 0 && bulkChunks.length > 0) {
            ok = !!(await bulkChunks.execute()).ok
            bulkChunks = this.mongo.unorderedBulk('fs.chunks')
          }
          ids.push(item._id)
        } else {
          await this.mongo.insert(item.collection, item.data)
          await this.mongo.delete('trash', { _id: item._id })
        }
        item = await items.next()
        i++
      }
      if (bulkChunks.length > 0) ok = !!(await bulkChunks.execute()).ok
      if (ok) {
        await this.mongo.delete('trash', { _id: { $in: ids } })
      }
      return ok
    }
    return false
  }
}