import { MongoClient, Db, FilterQuery, FindOneOptions, Cursor, IndexOptions } from 'mongodb'
import { Options, LocalsObject, render } from 'pug';
import { element, RootElement } from './Dom/Element';

export interface MongoConnectionInfo {
  hostname: string
  port: string
  database: string
  username?: string
  password?: string
}

export interface Setting {
  _id: any
  key: string
  value: any
}

export interface Page {
  path: string
  document: RootElement
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
      if (connection.username && (connection.password || '').trim().length == 0) throw new Error('Mongodb username requires a password')
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

  public async select<T extends any>(collection: string): Promise<Cursor<T>>

  /**
   * Selects unlimited items from the database
   *
   * @template T
   * @param {string} collection The collection to select from
   * @param {FilterQuery<any>} query The query filter
   * @returns {(Promise<T>)}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string, query: FilterQuery<any>): Promise<Cursor<T>>

  /**
   * Selects one item from the database
   *
   * @template T
   * @param {string} collection The collection to select from
   * @param {FilterQuery<any>} query The query filter
   * @param {1} limit Return the first found item **Note:** variables must be passed as `const`
   * @returns {Promise<T>}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string, query: FilterQuery<any>, limit: 1): Promise<T>

  /**
   * Selects more than one item from the database
   *
   * @template T
   * @param {string} collection The collection to select from
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
   * @param {string} collection The collection to select from
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
    let query = args.length == 1 ? {} : args[1] as FilterQuery<any>
    let limit = -1
    let options: FindOneOptions | undefined = args.length == 2 ? args[2] : {}
    let table = this.database.collection(collection)
    // Get the limit
    if (args.length == 3) limit = parseInt(args[2])
    else if (args.length == 4) limit = parseInt(args[3])
    if (options && limit > 0) options.limit = limit

    if (limit == 1) {
      return await table.findOne(query, options)
    }
    return await table.find<T>(query, options)
  }

  /**
   * Gets a setting from the settings table
   *
   * @param {string} key The setting key
   * @param {*} [defaultValue=null] The default setting value if the setting was not found
   * @returns
   * @memberof Mongo
   */
  public async setting<T extends any>(key: string, defaultValue: any = null): Promise<T> {
    let setting = await this.select<Setting>('settings', { key }, 1)
    return setting && setting.value ? setting.value : defaultValue
  }

  /**
   * Gets a list of setting values from the settings table
   *
   * @param {...string[]} keys A list of setting keys
   * @returns
   * @memberof Mongo
   */
  public async settings(...keys: string[]): Promise<{ [key: string]: any }> {
    let settings: Cursor<Setting>
    if (keys.length > 0) settings = await this.select<Setting>('settings', { key: { $in: keys } })
    else settings = await this.select<Setting>('settings')
    let data = await settings.toArray()
    return new Array(keys.length || data.length)
      .fill(null)
      .map((v, k) => keys.length > 0 ? data.find(i => i.key == keys[k]) || <Setting>{ key: '', value: '' } : data[k])
      .filter(i => i.key.length > 0)
      .map(i => { delete i._id; return i })
      .reduce<{ [key: string]: any }>((obj, itm) => {
        obj[itm.key] = itm.value
        return obj
      }, {})
  }

  public async renderPage(path: string, options?: any) {
    return element.stringify((await this.page(path)).document, options)
  }

  public async page(path: string) {
    return (await this.select<Page>('pages', { path }, 1)) || { path: '/', document: '' }
  }

  /**
   * Get the number of documents found
   *
   * @param {string} collection The collection to count
   * @param {FilterQuery<any>} query The query filter
   * @returns
   * @memberof Mongo
   */
  public async count(collection: string, query: FilterQuery<any>) {
    let table = this.database.collection(collection)
    return await table.countDocuments(query)
  }

  /**
   * Create one or more indexes
   *
   * @param {string} collection The collection to create the index on
   * @param {(object | object[])} specs The index key(s)
   * @param {IndexOptions} [options] Addition index options
   * @returns
   * @memberof Mongo
   */
  public async createIndex(collection: string, specs: object | object[], options?: IndexOptions) {
    let table = this.database.collection(collection)
    if (Array.isArray(specs)) {
      return await table.createIndexes(specs, options)
    }
    return await table.createIndex(specs, options)
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

  public async insertOrUpdate(collection: string, filter: FilterQuery<any>, data: object, limit = 0) {
    let total = await this.count(collection, filter)
    if (total >= 1) this.update(collection, filter, { $set: data }, limit)
    else if (total <= 0) this.insert(collection, Object.assign(filter, data))
  }

  public close() {
    this.client.close()
  }
}