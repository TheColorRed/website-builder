import { parse } from 'url'
import { join } from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as querystring from 'querystring'
import { IncomingMessage, IncomingHttpHeaders } from 'http'
import { AppStatus } from '.'
import { Route } from './Router';
import { Session } from './Session';
import { Response } from './Response';

export interface FileType {
  key: string
  filename: string
  tmpFilename: string
}

export class Client {

  public readonly method: string
  public readonly ajax: boolean = false
  public readonly appStatus: AppStatus
  public readonly session: Session

  private readonly _post: any
  private readonly _get: any
  private readonly _files: FileType[] = []
  private readonly _headers: IncomingHttpHeaders
  private readonly _response: Response

  public route!: Route

  public constructor(req: IncomingMessage, body: string, appStatus: AppStatus) {
    this.appStatus = appStatus
    this.method = (req.method || 'get').toLowerCase()
    this._get = querystring.parse(parse(req.url || '').query || '')
    this.ajax = req.headers['x-requested-with'] == 'XMLHttpRequest'
    this.session = new Session(req, this)
    this._response = new Response(this)
    this._headers = req.headers
    let contentType = this.headers.get<string>('content-type')
    if (contentType.includes('boundary=')) {
      let [type, boundary] = contentType.split('boundary=')
      this._post = {}
      body.split(new RegExp(`(--${boundary}|--${boundary}--)`)).forEach(item => {
        if (item.trim().toLowerCase().startsWith('content-disposition')) {
          item = item.trim()
          let result = item.split(':')[1].split(';').map(i => i.trim()).reduce((obj, itm) => {
            if (itm.startsWith('name=')) obj.name = (itm.match(/^name="(.+)"/) || [''])[1]
            if (itm.startsWith('filename=')) obj.filename = (itm.match(/^filename="(.+)"/) || [''])[1]
            return obj
          }, { name: '', filename: '' })
          if (result.filename.length > 0) {
            let temp = join(os.tmpdir(), 'builder-' + (Math.random() * 10000).toString(12).substr(5, 10))
            let [full, newlines, file] = Array.from(item.match(/^.+?(\r\n\r\n|\n\n)(.+)/s) || [])
            // fs.createWriteStream(temp + '-a').write(full, 'binary')
            fs.createWriteStream(temp).write(file, 'binary')
            this._files.push({
              key: result.name,
              filename: result.filename,
              // full: temp + '-a',
              tmpFilename: temp
            })
          } else {
            this._post[result.name] = item.split(/\r\n\r\n|\n\n/)[1]
          }
        }
      })
      console.log(this._files, this._post)
    } else {
      try {
        this._post = JSON.parse(body)
      } catch (e) {
        this._post = body
      }
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
      files(key: string) {
        return ($this._files.find(i => i.key == key))
      },
      get<T extends any>(key: string, defaultValue: any = ''): T {
        if ($this._get[key]) return $this._get[key]
        else return defaultValue
      },
      post<T extends any>(key: string, defaultValue: any = ''): T {
        if ($this._post[key]) return $this._post[key]
        return defaultValue
      },
      request<T extends any>(key: string, defaultValue: any = ''): T {
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
      get<T>(key: string, defaultValue: any = ''): T {
        let header = $this._headers[key.toLowerCase()]
        return header || defaultValue
      },
      is(key: string, value?: any) {
        let v = this.get(key)
        if (v && value) return v == value
        return !!v
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