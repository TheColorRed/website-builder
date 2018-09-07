import { GridFSBucket, ObjectID } from 'mongodb'
import * as fs from 'fs'
import * as mime from 'mime-types'
import { Mongo } from '../core';
import { MediaFile, MediaTrash } from '../models'
const Canvas = require('canvas-prebuilt')

export class MediaManager {
  private bulkSize: number = 20
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

  public async downsizeImage(file: MediaFile, width: number, height: number) {
    // Load the image from the database
    let img: any = await new Promise(resolve => {
      let imgData: string = ''
      let bucket = new GridFSBucket(this.mongo.db)
      let id = file._id instanceof ObjectID ? file._id : new ObjectID(file._id)
      bucket.openDownloadStream(id)
        .on('data', (chunk: Buffer) => imgData += chunk.toString('binary'))
        .once('end', () => {
          let img = new Canvas.Image
          img.onload = () => resolve(img)
          img.onerror = (err: Error) => console.error(err)
          img.src = Buffer.from(imgData, 'binary')
        })
    })

    // Don't allow the image to be scaled larger than it already is or smaller than 1
    width = Math.max(Math.min(img.width, width), 0)
    height = Math.max(Math.min(img.height, height), 0)

    // If only the width or the height is set
    if (width == 0 || height == 0) {
      // Set the height based on the width
      if (height == 0) {
        let ratio = width / img.width
        height = img.height * ratio
      }
      // Set the width based on the height
      else if (width == 0) {
        let ratio = height / img.height
        width = img.width * ratio
      }
    }

    // If the width or height is 0 make it 1
    // A canvas with a width and/or height of zero is invalid
    width = width == 0 ? 1 : width
    height = height == 0 ? 1 : height

    // Create the canvas based on the new width/height
    let canvas: any = new Canvas(width, height)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toBuffer('binary') as Buffer
  }
}