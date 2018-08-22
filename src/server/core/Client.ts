import { parse } from 'url'
import * as querystring from 'querystring'
import { IncomingMessage, IncomingHttpHeaders } from 'http'
import { AppStatus } from '.'
import { Route } from './Router';
import { Session } from './Session';
import { Response } from './Response';

export class Client {

  public readonly method: string
  public readonly ajax: boolean = false
  public readonly appStatus: AppStatus
  public readonly session: Session

  private readonly _post: any
  private readonly _get: any
  private readonly _headers: IncomingHttpHeaders
  private readonly _response: Response

  public route!: Route

  public constructor(req: IncomingMessage, body: string, appStatus: AppStatus) {
    this.appStatus = appStatus
    this.method = (req.method || 'get').toLowerCase()
    this._get = querystring.parse(parse(req.url || '').query || '')
    this.ajax = req.headers['x-requested-with'] == 'XMLHttpRequest'
    this.session = new Session(req, this)
    this._response = new Response()
    this._headers = req.headers
    try {
      this._post = JSON.parse(body)
    } catch (e) {
      this._post = body
    }
  }

  public get path(): string {
    if (this.route) return this.route.path
    return '/'
  }

  public get response() {
    return this._response
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
      },
      toObject() {
        let obj: { get: { [key: string]: any }, post: { [key: string]: any } } = { get: {}, post: {} }
        for (let key in $this._get) { obj.get[key] = $this._get[key] }
        for (let key in $this._post) { obj.get[key] = $this._post[key] }
        return Object.freeze(obj)
      }
    }
  }

  public get headers() {
    let $this = this
    return {
      get(key: string, defaultValue: any = '') {
        let header = $this._headers[key]
        return header || defaultValue
      },
      all() {
        return $this._headers
      }
    }
  }

  public setRoute(route: Route) {
    this.route = route
  }
}