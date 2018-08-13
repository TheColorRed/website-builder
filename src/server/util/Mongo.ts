import { MongoClient, Db, FilterQuery, FindOneOptions, Cursor } from 'mongodb'

export interface MongoConnectionInfo {
  hostname: string
  port: string
  database: string
  username?: string
  password?: string
}

export class Mongo {

  private client: MongoClient
  private database: Db

  /**
   * Connects to a mongo database
   *
   * @static
   * @param {MongoConnectionInfo} connection
   * @returns
   * @memberof Mongo
   */
  public static async connect(connection: MongoConnectionInfo) {
    try {
      if (connection.username && (connection.password || '').trim().length == 0) throw new Error('Username requires a password')
      let user = connection.username ? connection.username + ':' + connection.password + '@' : ''
      let client = await MongoClient.connect(`mongodb://${user}${connection.hostname}:${connection.port}`, { useNewUrlParser: true })
      return new Mongo(client, connection)
    } catch (e) {
      throw e
    }
  }

  /**
   * Creates an instance of Mongo.
   * @param {MongoClient} client
   * @param {MongoConnectionInfo} connection
   * @memberof Mongo
   */
  private constructor(client: MongoClient, connection: MongoConnectionInfo) {
    this.client = client
    this.database = this.client.db(connection.database)
  }

  /**
   * Selects one item from the database
   *
   * @template T
   * @param {string} collection The collection
   * @param {FilterQuery<any>} query The query filter
   * @returns {(Promise<T>)}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string, query: FilterQuery<any>): Promise<T>

  /**
   * Selects more than one item from the database
   *
   * @template T
   * @param {string} collection The collection
   * @param {FilterQuery<any>} query The query filter
   * @param {number} limit The number of items to select
   * @returns {Promise<Cursor<T>>}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string, query: FilterQuery<any>, limit: number): Promise<Cursor<T>>

  /**
   * Selects more than one item from the database with additional options
   *
   * @template T
   * @param {string} collection The collection
   * @param {FilterQuery<any>} query The query filter
   * @param {FindOneOptions} options Additional options
   * @param {number} limit The number of items to select
   * @returns {Promise<Cursor<T>>}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string, query: FilterQuery<any>, options: FindOneOptions, limit: number): Promise<Cursor<T>>
  public async select<T extends any>(...args: any[]): Promise<T | Cursor<T>> {
    // Set param defaults
    let collection = args[0] as string
    let query = args[1] as FilterQuery<any>
    let limit = 1
    let options: FindOneOptions | undefined = args.length == 2 ? args[2] : undefined
    let table = this.database.collection(collection)
    // Get the limit
    if (args.length == 3) limit = parseInt(args[2])
    else if (args.length == 4) limit = parseInt(args[3])
    if (options) options.limit = limit

    if (limit <= 1) {
      return await table.findOne(query, options)
    }
    return await table.find<T>(query, options)
  }

  /**
   * Inserts one or more items into the database
   *
   * @param {string} collection The collection to insert into
   * @param {(object | object[])} data The data to be inserted
   * @returns
   * @memberof Mongo
   */
  public async insert(collection: string, data: object | object[]) {
    let table = this.database.collection(collection)
    if (Array.isArray(data)) {
      return await table.insertMany(data)
    } else if (typeof data == 'object') {
      return await table.insertOne(data)
    }
  }

  /**
   * Updates one or more items in the database
   *
   * @param {string} collection The collection to update
   * @param {FilterQuery<any>} filter The query filter
   * @param {object} data The data to update
   * @param {number} [limit=0] The maximum number of items to update (0 = unlimited)
   * @returns
   * @memberof Mongo
   */
  public async update(collection: string, filter: FilterQuery<any>, data: object, limit = 0) {
    let table = this.database.collection(collection)
    if (limit <= 1) {
      return await table.updateOne(filter, data)
    }
    return await table.updateMany(filter, data)
  }

  public close() {
    this.client.close()
  }
}