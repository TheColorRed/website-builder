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
  expiration: number
  data: {
    [key: string]: any
  }
}