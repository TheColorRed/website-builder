import { OutgoingHttpHeaders } from 'http'

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

}