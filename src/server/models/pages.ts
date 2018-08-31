import { ObjectID } from 'bson'
import { RootElement } from '../core'

export interface Page {
  _id: ObjectID
  title: string
  createDate: Date
  updateDate: Date
  path: string
  document: RootElement
}