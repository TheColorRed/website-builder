import { Client, Element, Mongo, MongoConnectionInfo } from '../../core'
import * as path from 'path'
import { readJson, writeToJson, updateJsonFile } from '../../core/fs'
import { emitter, Events } from '../../core/Events'
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
    return client.response.json({ error: false })
  } catch (e) {
    return client.response.json({ error: true, message: e.message }, 500)
  }
}

export async function main(client: Client) {
  // Setup the default response
  let resp = { error: false, message: '' }
  // Get the current status
  let status = await readJson<{ installed: boolean }>(path.join(__dirname, '../resources/config/status.json'))
  // If the app is already installed, end the call
  if (status.installed) {
    resp.error = true
    resp.message = 'Application already installed'
    return client.response.json(resp, 500)
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

  return client.response.json(resp)
}

async function connect(client: Client) {
  // Get the database information
  let dbHostname = client.data.post<string>('db-hostname')
  let dbPortNumber = client.data.post<string>('db-port-number')
  let dbDatabase = client.data.post<string>('db-database')
  let dbUsername = client.data.post<string>('db-username')
  let dbPassword = client.data.post<string>('db-password')

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
  emitter.emit(Events.UpdateMongoConnection)
  return conn
}

async function createTableIndexes(conn: Mongo) {
  // Admin table
  await conn.createIndex('admin', { email: 1 }, { name: 'uniq_email', unique: true })
  await conn.createIndex('admin', { user: 1 }, { name: 'uniq_user', unique: true })

  // Application settings
  await conn.createIndex('settings', { key: 1 }, { name: 'uniq_key', unique: true })

  // Pages
  await conn.createIndex('pages', { path: 1 }, { name: 'uniq_path', unique: true })

  // Sessions
  await conn.createIndex('sessions', { id: 1 }, { name: 'uniq_id', unique: true })
  await conn.createIndex('sessions', { ttl: 1 }, { name: 'ttl', expireAfterSeconds: 0 })

  // Trash
  // Delete from trash in 30 days
  await conn.createIndex('trash', { ttl: 1 }, { name: 'ttl', expireAfterSeconds: 2.592e6 })
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

  // Insert the website title
  await conn.insert('settings', {
    key: 'website-title',
    value: client.data.post('website-title')
  })

  await createHomePage(conn)
}

export async function updateAppStatus() {
  let statusFile = path.join(__dirname, '../resources/config/status.json')
  updateJsonFile(statusFile, 'installed', true)
  emitter.emit(Events.UpdateAppStatus)
}

export async function createHomePage(mongo: Mongo) {
  let document = <Element>{
    tag: '.container',
    children: [
      'h1 {{settings.website-title}}',
      {
        tag: 'img[src=/media/boobs.png]'
        // tag: 'video[style="height:90vh;max-width:100%"]#videoPlayer:autoplay',
        // children: 'source[src=/media/bbb.mp4][type=video/mp4]'
      }
    ]
  }

  await mongo.insertOrUpdate('pages', { path: '/' }, { document })
}