import { UrlWithStringQuery } from 'url'
import * as path from 'path'
import { Client } from './Client'
import { Response } from '.'
import { Mongo } from './Mongo'

export type requestMethod = 'get' | 'post' | 'any'

export class route {

  private _name: string = ''

  public get routeName() { return this._name }

  public constructor(
    public readonly path: string,
    public readonly method: requestMethod,
    public readonly callback: string | ((client: Client, mongo: Mongo) => void | Response)
  ) { }

  public name(name: string) {
    if (Router.findByName(name)) throw new Error('Route name "' + name + '" already exists')
    this._name = name
    return this
  }
}

export class Router {

  private static routes: route[] = []

  public static async route(route: UrlWithStringQuery, client: Client, mongo: Mongo): Promise<Response> {
    // Try to find the route
    let theRoute = this.find(route, <requestMethod>client.req.method || 'get')

    let callback

    // If the callback is a string load the module from the controllers
    // Then get the function in the file
    if (theRoute && typeof theRoute.callback == 'string') {
      let [controller, method] = theRoute.callback.split('@')
      if (controller && method && controller.length > 0 && method.length > 0) {
        let module = await import(path.join(__dirname, '../controllers', controller))
        callback = module[method]
      }
    } else if (theRoute && typeof theRoute.callback == 'function') {
      callback = theRoute.callback
    }

    // If a valid route was found run the callback, otherwise send a 404
    return callback ? callback(client, mongo) : null
  }

  public static get(path: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)) {
    let r = new route(path, 'get', callback)
    this.routes.push(r)
    return r
  }

  public static post(path: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)) {
    this.routes.push()
    let r = new route(path, 'post', callback)
    this.routes.push(r)
    return r
  }

  public static any(path: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)) {
    this.routes.push()
    let r = new route(path, 'any', callback)
    this.routes.push(r)
    return r
  }

  public static findByName(name: string) {
    return this.routes.find(r => r.routeName == name)
  }

  private static find(route: UrlWithStringQuery, method: requestMethod) {
    // Find routes based on exact match
    let theRoute = this.routes.find(r => r.path == route.pathname && method.toLowerCase() == r.method.toLowerCase())
    // If no exact match was found,
    if (!theRoute) {
      // TODO: find with placeholder examples:
      //    "/post/:id", "/users/:username", etc.
    }
    return theRoute
  }
}