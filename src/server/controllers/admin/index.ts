import { Client, Router, Route } from '../../core'
import { Mongo } from '../../core/Mongo'
import * as bcrypt from 'bcrypt'
import { AdminModel } from '../../models/admin'

export async function login(client: Client, mongo: Mongo) {
  let user = client.data.post('username')
  let password = client.data.post('password')
  let message = 'Invalid username and/or password'
  let result = await mongo.select<AdminModel>('admin', { user }, 1)
  if (!result) return client.response.json({ error: true, message })
  let isValidPassword = await bcrypt.compare(password, result.password)

  client.session.set('admin.user', result.user)
  client.session.set('admin.first', result.first)
  client.session.set('admin.last', result.last)
  client.session.set('admin.email', result.email)

  return client.response.json({
    error: !isValidPassword,
    message: !isValidPassword ? message : '',
    location: (<Route>Router.findByName('admin-home')).path
  })
}