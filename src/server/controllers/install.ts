import { Client, response, AppStatus } from '../util'
import * as path from 'path'
import { readJson, writeToJson } from '../util/fs'
import { Mongo, MongoConnectionInfo } from '../util/Mongo'
import { emitter } from '../util/Events'
import * as bcrypt from 'bcrypt'

export async function testConnection(client: Client) {
  // Crete the connection object
  let connection: MongoConnectionInfo = {
    hostname: client.data.post('db-hostname'),
    port: client.data.post('db-port-number'),
    database: client.data.post('db-database'),
    username: client.data.post('db-username'),
    password: client.data.post('db-password')
  }

  // Test the connection
  try {
    let mongo = await Mongo.connect(connection)
    mongo.close()
    return response().json({ error: false })
  } catch (e) {
    return response().json({ error: true, message: e.message }, 500)
  }
}

export async function install(client: Client) {
  // Setup the default response
  let resp = { error: false, message: '' }
  // Get the current status
  let status = await readJson<{ installed: boolean }>(path.join(__dirname, '../resources/config/status.json'))
  // If the app is already installed, end the call
  if (status.installed) {
    resp.error = true
    resp.message = 'Application already installed'
    return response().json(resp, 500)
  }

  try {
    // Create and write connection
    let conn = await connect(client)
    // Check if there is already a master user
    let items = await conn.count('admin', { master: true })
    if (items > 0) throw new Error('There is already a master user.')
    // Create the needed table indexes
    await createTableIndexes(conn)
    // Insert data into the tables
    await insertTableData(conn, client)
    // Update the application status
    await updateAppStatus()
    // Close the mongodb connection
    conn.close()
  } catch (e) {
    resp.error = true
    resp.message = e.message
  }

  return response().json(resp)
}

async function connect(client: Client) {
  // Get the database information
  let dbHostname = client.data.post('db-hostname')
  let dbPortNumber = client.data.post('db-port-number')
  let dbDatabase = client.data.post('db-database')
  let dbUsername = client.data.post('db-username')
  let dbPassword = client.data.post('db-password')

  let connection = {
    hostname: dbHostname,
    port: dbPortNumber,
    database: dbDatabase,
    username: dbUsername,
    password: dbPassword
  }

  // The file to save the connection information
  let file = path.join(__dirname, '../resources/config/database/connection.json')

  // Try and create the connection, will throw error if it fails
  let conn = await Mongo.connect(connection)

  // Write the connection to file if the connection is successful
  await writeToJson(file, connection)

  // let the app know that the connection information has changed
  emitter.emit('update-mongo-connection')
  return conn
}

async function createTableIndexes(conn: Mongo) {
  await conn.createIndex('admin', { email: 1 }, { name: 'uniq_email', unique: true })
  await conn.createIndex('admin', { user: 1 }, { name: 'uniq_user', unique: true })
}

async function insertTableData(conn: Mongo, client: Client) {
  // Get the admin information
  let adminUsername = client.data.post('admin-username')
  let adminPassword = client.data.post('admin-password')
  let adminFirst = client.data.post('admin-first')
  let adminLast = client.data.post('admin-last')
  let adminEmail = client.data.post('admin-email')

  await conn.insert('admin', {
    user: adminUsername,
    password: await bcrypt.hash(adminPassword, 10),
    first: adminFirst,
    last: adminLast,
    email: adminEmail,
    master: true
  })
}

export async function updateAppStatus() {
  let statusFile = path.join(__dirname, '../resources/config/status.json')
  let data = await readJson<AppStatus>(statusFile)
  data.installed = true
  await writeToJson(path.join(__dirname, '../resources/config/status.json'), data)
  emitter.emit('update-app-status')
}