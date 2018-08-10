import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'url'
import * as querystring from 'querystring'
import { renderFile } from 'pug'
import { ServerResponse, IncomingMessage } from 'http'
import { Response } from '.'

export class Client {

  public readonly req: IncomingMessage
  public readonly res: ServerResponse
  public readonly path: string
  public readonly method: string
  public readonly _post: any
  public readonly _get: any

  public constructor(req: IncomingMessage, res: ServerResponse, body: string) {
    this.req = req
    this.res = res
    this.method = (req.method || 'get').toLowerCase()
    this.path = req.url || '/'
    this._get = querystring.parse(parse(req.url || '').query || '')
    try {
      this._post = JSON.parse(body)
    } catch (e) {
      this._post = body
    }
  }

  public get data() {
    let $this = this
    return {
      get(key: string, defaultValue: string = '') {
        if ($this._get[key]) return $this._get[key]
        else return defaultValue
      },
      post(key: string, defaultValue: string = '') {
        if ($this._post[key]) return $this._post[key]
        return defaultValue
      },
      request(key: string, defaultValue: string = '') {
        if ($this._get[key]) return $this._get[key]
        else if ($this._post[key]) return $this._post[key]
        else return defaultValue
      }
    }
  }

  public file(path: string) {
    return new Response(readFileSync(path).toString())
  }

  public pug(path: string) {
    return new Response()
      .setBody(renderFile(path))
  }

  public json(data: any) {
    return new Response()
      .setBody(JSON.stringify(data))
      .setHeaders({ 'Content-Type': 'application/json' })
  }

  public redirect(path: string) {
    return new Response()
      .setCode(302)
      .setHeaders({ 'Location': path })
  }

  public send404() {
    return new Response()
      .setCode(404)
      .setBody(this.pug(join(__dirname, '../resources/views/errors/404.pug')).body)
  }

  public write(response: Response) {
    this.res.writeHead(response.code, response.headers)
    this.res.write(response.body)
    this.res.end()
  }
}