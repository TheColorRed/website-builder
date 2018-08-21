import { IncomingMessage } from 'http'
import * as cookie from 'cookie'
import { CookieSerializeOptions } from 'cookie'
import * as crypto from 'crypto'
import { mongoClient } from './Mongo'
import { AdminSessionModel } from '../models/admin'
import { Client } from './Client'

export class Session {
  private _database: string = 'sessions'
  private _closed: boolean = false
  private _started: boolean = false

  private _record: AdminSessionModel = {
    id: '',
    ttl: new Date(),
    flash: [],
    cookie: {
      path: '/'
    },
    data: {}
  }

  public constructor(private req: IncomingMessage, private client: Client) { }

  public async start(options?: CookieSerializeOptions) {
    if (this._started) return
    this._started = true
    // the current time
    let date = Date.now()
    // The number of seconds the session should live for
    let seconds = 60 * 60 * 24 * 7
    // Get the cookies
    let cookies = cookie.parse(<string>this.req.headers.cookie || '')
    // Get the cookie sessid
    let id = cookies.sessid || ''
    // Try to find the record in the database
    let record = await mongoClient.select<AdminSessionModel>(this._database, { id }, 1)
    if (!record) {
      await this.createSession(options)
      return
    }
    // If the session exits, update it's ttl
    record.ttl = new Date(date + (seconds * 1000))
    this._record.cookie.maxAge = seconds
    // Send the new cookie info to the client
    this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', id, this._record.cookie))
    this._record = record
  }

  /**
   * Writes the session data to disk.
   *
   * @memberof Session
   */
  public async close() {
    if (this._closed || !this._started) return
    this._closed = true
    // find flashed items
    let toRemove = this._record.flash.filter(i => i.hits > 0)
    let i = toRemove.length
    while (i--) {
      // Delete the flash item and it's reference
      let idx = this._record.flash.findIndex(c => c.key == toRemove[i].key)
      this._record.flash.splice(idx, 1)
      this.remove(toRemove[i].key)
    }
    // Increment items that are still in the flash
    this._record.flash.forEach(i => i.hits++)
    // Update the mongo database
    await mongoClient.update(this._database, { id: this._record.id }, { $set: this._record })
  }

  /**
   * Regenerates the session id.
   *
   * @static
   * @memberof Session
   */
  public async regenerate() {
    // await this.createSession()
  }

  /**
   * Sets a session value that only lives through the subsequent request
   *
   * @param {string} key The key to save. Supports nested objects by dot separator.
   * @param {*} value The value to save in the key.
   * @memberof Session
   */
  public flash(key: string, value: any) {
    this.set(key, value)
    this._record.flash.push({ key, hits: 0 })
  }

  /**
   * Sets a key in the session data.
   *
   * @param {string} key The key to save. Supports nested objects by dot separator.
   * @param {*} value The value to save in the key.
   * @memberof Session
   */
  public set(key: string, value: any) {
    let path = key.split('.')
    let target = path.pop() as string
    function setItm(obj: any) {
      if (path.length == 0) {
        obj[target] = value
        return
      }
      let itm = path.shift() as string
      if (!obj[itm]) obj[itm] = {}
      setItm(obj[itm])
      return obj
    }
    setItm(this._record.data)
  }

  /**
   * Gets an item from the session data.
   *
   * @param {string} key The key to find. Supports nested objects by dot separator.
   * @param {*} [defaultValue='']
   * @returns
   * @memberof Session
   */
  public get(key: string, defaultValue: any = '') {
    let path = key.split('.')
    let data = path.reduce((obj, key) => typeof obj == 'object' ? obj[key] : null, this._record.data)
    return data || defaultValue
  }

  /**
   * Deletes an item from the object
   *
   * @param {string} key The key to find. Supports nested objects by dot separator.
   * @memberof Session
   */
  public remove(key: string) {
    let path = key.split('.')
    let keyParent = path
      // Get new array without last item
      .slice(0, path.length - 1)
      // Reduce the data
      .reduce((obj, key) => obj != undefined ? obj[key] : undefined, this._record.data)
    // If we have something, delete it
    if (typeof keyParent != 'undefined' || keyParent != undefined) delete keyParent[path[path.length - 1]]
  }

  /**
   * Checks if the key exists.
   *
   * @param {string} key The key to find. Supports nested objects by dot separator.
   * @returns
   * @memberof Session
   */
  public is(key: string) {
    return !!this.get(key, false)
  }

  private createId() {
    return crypto.createHash('md5').update(((Math.random() * 1e6) + Date.now()).toString()).digest('hex').toString()
  }

  private async createSession(options?: CookieSerializeOptions) {
    let date = Date.now()
    let seconds = 60 * 60 * 24 * 7
    // Create a new session id
    let id = this.createId()
    this._record.id = id
    // Set the ttl so mongo can delete the item when it expires
    // Multiply by 1000 to convert seconds to milliseconds
    this._record.ttl = new Date(date + (seconds * 1000))
    // This is the browser age, it is in seconds
    this._record.cookie.maxAge = seconds
    // Merge the cookie options with the default options
    this._record.cookie = Object.assign(this._record.cookie, options)
    // Save the session information
    await mongoClient.insert<AdminSessionModel>(this._database, this._record)
    // Send the cookie info to the client
    this.client.response.setHeader('Set-Cookie', cookie.serialize('sessid', id, this._record.cookie))
  }
}