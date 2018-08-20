import { Client, response } from '../../core'
import { Mongo } from '../../core/Mongo'
import * as bcrypt from 'bcrypt'
import { AdminModel } from '../../models/admin';

export async function login(client: Client, mongo: Mongo) {
  let user = client.data.post('username')
  let password = client.data.post('password')
  let message = 'Invalid username and/or password'
  let result = await mongo.select<AdminModel>('admin', { user }, 1)
  if (!result) return response().json({ error: true, message })
  let isValidPassword = await bcrypt.compare(password, result.password)
  let session = await client.session.start()

  await client.session.set('abc', 123)

  return session.json({
    error: !isValidPassword,
    message: !isValidPassword ? message : ''
  })
}