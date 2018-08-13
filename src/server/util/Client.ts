import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'url'
import * as querystring from 'querystring'
import { renderFile } from 'pug'
import { ServerResponse, IncomingMessage } from 'http'
import { Response } from '.'
import { Router } from './Router';

export class Client {

  public readonly req: IncomingMessage
  public readonly res: ServerResponse
  public readonly path: string
  public readonly method: string
  public readonly ajax: boolean = false
  public readonly _post: any
  public readonly _get: any

  public constructor(req: IncomingMessage, res: ServerResponse, body: string) {
    this.req = req
    this.res = res
    this.method = (req.method || 'get').toLowerCase()
    this.path = req.url || '/'
    this._get = querystring.parse(parse(req.url || '').query || '')
    this.ajax = req.headers['x-requested-with'] == 'XMLHttpRequest'
    try {
      this._post = JSON.parse(body)
    } catch (e) {
      this._post = body
    }
  }

  public get data() {
    let $this = this
    return {
      get(key: string, defaultValue: string = ''): string {
        if ($this._get[key]) return $this._get[key]
        else return defaultValue
      },
      post(key: string, defaultValue: string = ''): string {
        if ($this._post[key]) return $this._post[key]
        return defaultValue
      },
      request(key: string, defaultValue: string = ''): string {
        if ($this._get[key]) return $this._get[key]
        else if ($this._post[key]) return $this._post[key]
        else return defaultValue
      }
    }
  }

  public write(response: Response) {
    this.res.writeHead(response.code, response.headers)
    this.res.write(response.body)
    this.res.end()
  }
}