import { Client, response } from '../util'
import * as path from 'path'
import { readJson, writeToJson } from '../util/fs'
import { Mongo, MongoConnectionInfo } from '../util/Mongo'
import { emitter } from '../util/Events'
import * as bcrypt from 'bcrypt'

export async function testConnection(client: Client) {
  let connection: MongoConnectionInfo = {
    hostname: client.data.post('db-hostname'),
    port: client.data.post('db-port-number'),
    database: client.data.post('db-database'),
  }
  let username = client.data.post('db-username')
  let password = client.data.post('db-password')
  if (username.length > 0) connection['username'] = username
  if (password.length > 0) connection['username'] = username
  console.log(connection)
  try {
    let mongo = await Mongo.connect(connection)
    mongo.close()
    return response().json({ error: false })
  } catch (e) {
    return response().json({ error: true, message: e.message })
  }
}

export function installPage(client: Client) {
  try {
    return response().pug(path.join(__dirname, '../resources/views/pages/installer.pug'))
  } catch (e) {
    return response().redirect.to('home')
  }
}

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

  let resp = {
    error: false,
    message: ''
  }

  // The file to save the connection information
  let file = path.join(__dirname, '../resources/config/database/connection.json')

  try {
    // Try and create the connection
    let conn = await Mongo.connect(connection)
    // Write the connection to file if the connection is successful
    await writeToJson(file, connection)
    // Insert the new user into the database
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
    resp.error = true
    resp.message = e.message
  }

  return response().json(resp)
}