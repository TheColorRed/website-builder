import { CookieSerializeOptions } from 'cookie'

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