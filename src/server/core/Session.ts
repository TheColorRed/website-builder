import { IncomingMessage, ServerResponse } from 'http'
import * as cookie from 'cookie'
import * as crypto from 'crypto'
import { mongoClient } from './Mongo'
import { AdminModel, AdminSessionModel } from '../models/admin'
import { response } from './Response'

export class Session {
  // private sessid: string | null = null
  // private data: any = {}
  private expiration = 60 * 60 * 24 * 30
  private database: string = 'sessions'

  private record: AdminSessionModel = {
    id: '',
    expiration: 0,
    data: {}
  }

  public constructor(private req: IncomingMessage, private res: ServerResponse) { }

  public async start() {
    let cookies = cookie.parse(<string>this.req.headers.cookie || '')
    let id = cookies.sessid || ''
    let record = await mongoClient.select<AdminSessionModel>(this.database, { id }, 1)
    if (!record) {
      id = crypto.createHash('md5').update(((Math.random() * 1e6) + Date.now()).toString()).digest('hex').toString()
      this.record.id = id
      this.record.expiration = this.expiration
      await mongoClient.insert<AdminSessionModel>(this.database, this.record)
      return response().setHeader('Set-Cookie', cookie.serialize('sessid', id, {
        maxAge: this.expiration
      }))
    }
    this.record = record
    return response()
  }

  public async set(key: string, value: any) {
    this.record.data[key] = value
    await mongoClient.update(this.database, { id: this.record.id }, { $set: this.record })
  }

  public get(key: string, defaultValue = '') {
    return this.record.data[key] || defaultValue
  }
}