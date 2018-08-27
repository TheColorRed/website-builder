import { ObjectID } from 'bson'

export interface MediaObject {
  _id: ObjectID | string
  length: number
  chunkSize?: number
  uploadDate: string
  filename: string
  md5?: string
  metadata: {
    mime: string
    type: string
    ext: string
  }
}

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