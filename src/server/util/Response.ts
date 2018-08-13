import { OutgoingHttpHeaders } from 'http'
import { Router } from './Router'
import { renderFile } from 'pug'
import { readFileSync } from 'fs'
import { join } from 'path'

export function response() {
  return new Response()
}

export class Response {

  public constructor(public _body: string = '', public _headers: OutgoingHttpHeaders = {
    'Content-Type': 'text/html'
  }, public _code: number = 200) { }

  public get code(): number { return this._code }
  public get body(): string { return this._body }
  public get headers(): OutgoingHttpHeaders { return this._headers }

  public setCode(code: number) {
    this._code = code
    return this
  }

  public setBody(body: string) {
    this._body = body
    return this
  }

  public setHeaders(headers: OutgoingHttpHeaders) {
    this._headers = Object.assign(this._headers, headers)
    return this
  }

  public setHeader(key: string, value: string) {
    this._headers[key] = value
    return this
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

  public get redirect() {
    return {
      to: function (name: string) {
        let route = Router.findByName(name)
        return new Response()
          .setCode(302)
          .setHeader('Location', route ? route.path : '')
      },
      location: function (path: string) {
        return new Response()
          .setCode(302)
          .setHeaders({ 'Location': path })
      }
    }
  }

  public send404() {
    return new Response()
      .setCode(404)
      .setBody(this.pug(join(__dirname, '../resources/views/errors/404.pug')).body)
  }

  public send500() {
    return new Response()
      .setCode(500)
      .setBody(this.pug(join(__dirname, '../resources/views/errors/500.pug')).body)
  }

}