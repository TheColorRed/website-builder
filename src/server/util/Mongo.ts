import { MongoClient } from 'mongodb'

export interface MongoConnectionInfo {
  hostname: string
  port: string
  database: string
  username: string
  password: string
}

export class Mongo {

  private client: MongoClient
  private connection: MongoConnectionInfo

  private constructor(client: MongoClient, connection: MongoConnectionInfo) {
    this.client = client
    this.connection = connection
  }

  public static async connect(connection: MongoConnectionInfo) {
    try {
      let user = connection.username && connection.password ? connection.username + ':' + connection.password + '@' : ''
      let client = await MongoClient.connect(`mongodb://${user}${connection.hostname}:${connection.port}`, { useNewUrlParser: true })
      return new Mongo(client, connection)
    } catch (e) {
      throw e
    }
  }

  public async insert(collection: string, data: object | object[]) {
    let table = this.client.db(this.connection.database).collection(collection)
    if (Array.isArray(data)) {
      return await table.insertMany(data)
    } else if (typeof data == 'object') {
      return await table.insertOne(data)
    }
  }

  public close() {
    this.client.close()
  }
}