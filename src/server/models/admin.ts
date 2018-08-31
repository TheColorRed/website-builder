import { CookieSerializeOptions } from 'cookie'
import { RootElement } from '../core'

export interface AdminModel {
  user: string
  password: string
  first: string
  last: string
  email: string
  master: boolean
}

export interface AdminSessionModel {
  id: string
  cookie: CookieSerializeOptions
  ttl: Date
  csrf: string
  flash: {
    key: string
    hits: number
  }[]
  data: { [key: string]: any }
}

export interface Setting {
  _id?: any
  key: string
  value: any
}
