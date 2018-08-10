import { Client } from '../util'
import * as path from 'path'
import { readJson, writeToJson } from '../util/fs'
import { Mongo } from '../util/Mongo'
import { emitter } from '../util/Events'
import * as bcrypt from 'bcrypt'

export async function install(client: Client) {
  let data = await readJson<{ installed: boolean }>(path.join(__dirname, '../resources/config/status.json'))
  if (data.installed) return
  // Get the database information
  let dbHostname = client.data.post('db-hostname')
  let dbPortNumber = client.data.post('db-port-number')
  let dbDatabase = client.data.post('db-database')
  let dbUsername = client.data.post('db-username')
  let dbPassword = client.data.post('db-password')

  // Get the admin information
  let adminUsername = client.data.post('admin-username')
  let adminPassword = client.data.post('admin-password')
  let adminFirst = client.data.post('admin-first')
  let adminLast = client.data.post('admin-last')
  let adminEmail = client.data.post('admin-email')

  let connection = {
    hostname: dbHostname,
    port: dbPortNumber,
    database: dbDatabase,
    username: dbUsername,
    password: dbPassword
  }

  let response = {
    error: false,
    message: ''
  }

  let file = path.join(__dirname, '../resources/config/database/connection.json')
  await writeToJson(file, connection)
  try {
    let conn = await Mongo.connect(connection)
    await conn.insert('admin', {
      user: adminUsername,
      password: await bcrypt.hash(adminPassword, 10),
      first: adminFirst,
      last: adminLast,
      email: adminEmail
    })
    emitter.emit('update-mongo-connection')
    conn.close()
  } catch (e) {
    response.error = true
    response.message = e.message
  }

  return client.json(response)
}