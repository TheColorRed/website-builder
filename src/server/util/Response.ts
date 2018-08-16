import * as fs from 'fs'
import * as mime from 'mime-types'
import { OutgoingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import { renderFile, Options, LocalsObject, compile } from 'pug'
import { join, resolve } from 'path'
import { Router } from './Router'

export function response() {
  return new Response()
}

export function render(path: string, options: Options & LocalsObject = {}) {
  try {
    path = path.startsWith('/') ? path.replace(/^\//g, '') : path
    path = path.endsWith('.pug') ? path : path + '.pug'
    let file = resolve(join(__dirname, '../resources/views'), path)
    return response().pug(file, options)
  } catch (e) {
    return response().send500()
  }
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

  public file(path: string, code = 200) {
    return new Response(fs.readFileSync(path).toString()).setCode(code)
  }

  public pug(path: string): Response
  public pug(path: string, code: number): Response
  public pug(path: string, options: Options & LocalsObject): Response
  public pug(path: string, options: Options & LocalsObject, code: number): Response
  public pug(...args: any[]) {
    let path = args[0] as string
    let options = (args.length == 3 || (args.length == 2 && typeof args[1] != 'number') ? args[1] : {}) as Options & LocalsObject
    let code = args.length == 2 && typeof args[1] == 'number' ? args[1] :
      args.length == 3 ? args[2] : 200

    return new Response()
      .setBody(renderFile(path, options))
      .setCode(code)
  }

  public fromTemplate(template: string, options: Options & LocalsObject = {}, code: number = 200): Response {
    let fn = compile(template.replace(/\\n/g, '\n'))
    return new Response()
      .setBody(fn(options))
      .setCode(code)
  }

  public json(data: any, code = 200) {
    return new Response()
      .setBody(JSON.stringify(data))
      .setCode(code)
      .setHeaders({ 'Content-Type': 'application/json' })
  }

  public html(data: string, code = 200) {
    return new Response()
      .setBody(data)
      .setCode(code)
      .setHeaders({ 'Content-Type': 'text/html' })
  }

  public get redirect() {
    return {
      to: function (name: string) {
        let route = Router.findByName(name)
        return new Response()
          .setCode(302)
          .setHeader('Location', route ? route.path : '/')
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