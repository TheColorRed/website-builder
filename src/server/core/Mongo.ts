import { MongoClient, Db, FilterQuery, FindOneOptions, Cursor, IndexOptions, InsertOneWriteOpResult, InsertWriteOpResult, AggregationCursor } from 'mongodb'
import { element } from './Dom/Element'
import { Setting, Page } from '../models';

export interface MongoConnectionInfo {
  hostname: string
  port: string
  database: string
  username?: string
  password?: string
}

export let mongoClient: Mongo

export function setClient(client: Mongo) {
  mongoClient = client
}

declare type aggregationPipeline = {
  $addFields?: {}
  $bucket?: {}
  $bucketAuto?: {}
  $collStats?: {}
  $count?: {}
  $currentOp?: {}
  $facet?: {}
  $geoNear?: {}
  $graphLookup?: {}
  $group?: {}
  $indexStats?: {}
  $limit?: {}
  $listLocalSessions?: {}
  $listSessions?: {}
  $lookup?: {}
  $match?: {}
  $out?: {}
  $project?: {}
  $redact?: {}
  $replaceRoot?: {}
  $sample?: {}
  $skip?: {}
  $sort?: {}
  $sortByCount?: {}
  $unwind?: {}
}

declare type queryType = FilterQuery<any> | aggregationPipeline[]

export class Mongo {

  private readonly client: MongoClient
  private readonly database: Db

  public get db(): Db { return this.database }

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

  /**
   * Selects all items from the collection.
   *
   * @template T
   * @param {string} collection The collection to select from.
   * @returns {Promise<Cursor<T>>}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string): Promise<Cursor<T>>

  /**
   * Selects unlimited items from the database
   *
   * @template T
   * @param {string} collection The collection to select from.
   * @param {FilterQuery<any>} query The query filter.
   * @returns {(Promise<T>)}
   * @memberof Mongo
   */
  public async select<T extends any>(collection: string, query: FilterQuery<T>): Promise<Cursor<T>>

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
  public async select<T extends any>(collection: string, query: FilterQuery<T>, limit: 1): Promise<T>

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
  public async select<T extends any>(collection: string, query: FilterQuery<T>, limit: number): Promise<Cursor<T>>

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
  public async select<T extends any>(collection: string, query: FilterQuery<T>, options: FindOneOptions, limit: number): Promise<Cursor<T>>
  public async select<T extends any>(...args: any[]): Promise<T | Cursor<T> | AggregationCursor<T>> {

    // Set param defaults
    let collection = args[0] as string
    let query: queryType = args.length == 1 ? {} : args[1] as FilterQuery<any>
    let limit = -1
    let options: FindOneOptions | undefined = args.length == 2 ? args[2] : {}
    let table = this.database.collection(collection)
    // Get the limit
    if (args.length == 3) limit = parseInt(args[2])
    else if (args.length == 4) limit = parseInt(args[3])
    if (options && limit > 0) options.limit = limit

    // Find one
    if (limit == 1) return await table.findOne(query, options)
    // Find many
    return await table.find<T>(query, options)
  }

  /**
   * Selects from the database using the aggregation pipeline.
   *
   * @template T
   * @param {string} collection The collection to select from.
   * @param {object[]} pipeline The aggregation pipeline.
   * @returns {Promise<AggregationCursor<T>>}
   * @memberof Mongo
   */
  public async aggregate<T extends any>(collection: string, pipeline: aggregationPipeline[]): Promise<AggregationCursor<T>> {
    let table = this.database.collection(collection)
    return await table.aggregate<T>(pipeline)
  }

  public sanitize(item: string): string
  public sanitize(item: string[]): string[]
  public sanitize(item: string | string[]) {
    let regexp = /^\$/
    if (Array.isArray(item)) return item.map(i => typeof i == 'string' && i.replace(regexp, ''))
    return item.replace(regexp, '')
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
  public async insert<T>(collection: string, data: T): Promise<InsertOneWriteOpResult>
  public async insert<T>(collection: string, data: T[]): Promise<InsertWriteOpResult>
  public async insert<T>(collection: string, data: T | T[]): Promise<InsertOneWriteOpResult | InsertWriteOpResult | void> {
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
  public async update<T>(collection: string, filter: FilterQuery<any>, data: T, limit = 0) {
    let table = this.database.collection(collection)
    if (limit <= 1) {
      return await table.updateOne(filter, data)
    }
    return await table.updateMany(filter, data)
  }

  public async delete(collection: string, filter: FilterQuery<any>, limit?: number) {
    let table = this.database.collection(collection)
    if (limit && limit == 1) {
      return await table.deleteOne(filter)
    } else {
      return await table.deleteMany(filter)
    }
  }

  public async insertOrUpdate(collection: string, filter: FilterQuery<any>, data: object, limit = 0) {
    let total = await this.count(collection, filter)
    if (total >= 1) this.update(collection, filter, { $set: data }, limit)
    else if (total <= 0) this.insert(collection, Object.assign(filter, data))
  }

  public unorderedBulk(collection: string) {
    return this.db.collection(collection).initializeUnorderedBulkOp()
  }

  public orderedBulk(collection: string) {
    return this.db.collection(collection).initializeOrderedBulkOp()
  }

  public close() {
    this.client.close()
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
  public async settings(...keys: string[]) {
    let settings: Cursor<Setting>
    if (keys.length > 0) settings = await this.select<Setting>('settings', { key: { $in: keys } })
    else settings = await this.select<Setting>('settings')
    let data = await settings.toArray()
    let items = new Array<Setting>(keys.length || data.length)
      .fill({ _id: '', key: '', value: '' })
      .map((i, k) => keys.length > 0 ? data.find(i => i.key == keys[k]) || i : data[k])
      .map(i => { delete i._id; return i })
      .filter(i => String(i.key.trim()))
      .reduce<{ [key: string]: any }>((obj, itm) => { obj[itm.key] = itm.value; return obj }, {})

    // Create a proxy and freeze it
    let p = new Proxy({
      items: Object.freeze(items),
      get(k: string, defaultValue: any = '') { return this.items[k] || defaultValue }
    }, {
        get(target: any, propertyKey: any) {
          let prop = propertyKey.toString()
          return target[prop] || target.items[prop] || ''
        }
      })
    return Object.freeze(p) as { get(k: string, defaultValue?: any): any }
  }

  /**
   * Get a page from the database
   *
   * @param {string} path The url path
   * @returns
   * @memberof Mongo
   */
  public async page(path: string) {
    return (await this.select<Page>('pages', { path }, 1)) || { path: '/', document: '' }
  }

  /**
   * Get and render a page from the database
   *
   * @param {string} path The url path
   * @param {{ [key: string]: any }} [options] Options to be used in the template
   * @returns
   * @memberof Mongo
   */
  public async renderPage(path: string, options?: { [key: string]: any }) {
    // console.log(options)
    return element.stringify((await this.page(path)).document, options)
  }

}