import { UrlWithStringQuery } from 'url'
import * as path from 'path'
import { Client } from './Client'
import { Response } from '.'
import { Mongo } from './Mongo'
import { response } from './Response';

export type requestMethod = 'get' | 'post' | 'any'

export interface RouterOptions {
  middleware?: Function[]
}

export class Route {

  private _name: string = ''
  public routeOptions: RouterOptions = {}
  public groupOptions: RouterOptions[] = []

  public get routeName() { return this._name }

  public constructor(
    public readonly path: string,
    public readonly method: requestMethod,
    public readonly callback: string | ((client: Client, mongo: Mongo) => void | Response)
  ) {
    this.path = this.path.replace(/\\/g, '/').replace(/\/$/g, '')
    if (!this.path.startsWith('/')) this.path = '/' + this.path
    console.log(this.path)
  }

  public setRouteOptions(options: RouterOptions) {
    this.routeOptions = options
  }

  public setGroupOptions(options: RouterOptions[]) {
    this.groupOptions = options
  }

  public name(name: string) {
    if (Router.findByName(name)) throw new Error('Route name "' + name + '" already exists')
    this._name = name
    return this
  }
}

export class Router {

  private static readonly routes: Route[] = []
  private static readonly groupPath: string[] = []
  private static readonly groupOptions: RouterOptions[] = []

  public static async route(route: UrlWithStringQuery, client: Client, mongo: Mongo): Promise<Response | null> {
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

    if (theRoute) {
      // Test the group middleware
      if (theRoute.groupOptions.length > 0) {
        for (let c of theRoute.groupOptions) {
          if (c.middleware) {
            for (let i of c.middleware) {
              let result = i(client)
              if (!result) return response().send500()
            }
          }
        }
      }
      // Test the route specific middleware
      if (theRoute.routeOptions.middleware) {
        for (let i of theRoute.routeOptions.middleware) {
          let result = i(client)
          if (!result) return response().send500()
        }
      }
    }

    // If a valid route was found run the callback, otherwise send a 404
    return callback ? callback(client, mongo) : null
  }

  public static async group(path: string, callback: Function): Promise<void>
  public static async group(path: string, options: RouterOptions, callback: Function): Promise<void>
  public static async group(...args: any[]): Promise<void> {
    let path = args[0] as string
    let callback = args.length == 3 ? args[2] : args[1]
    this.groupOptions.push(args.length == 3 ? args[1] : {})
    this.groupPath.push(path)
    await callback()
    this.groupPath.pop()
    this.groupOptions.pop()
  }

  public static get(routePath: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)): Route
  public static get(routePath: string, options: RouterOptions, callback: string | ((client: Client, mongo: Mongo) => void | Response)): Route
  public static get(...args: any[]): Route {
    let callback = args.length == 3 ? args[2] : args[1]
    let r = new Route(path.join(...this.groupPath, args[0]), 'get', callback)
    r.setGroupOptions(Object.assign([], this.groupOptions))
    args.length == 3 && r.setRouteOptions(args[1])
    this.routes.push(r)
    return r
  }

  public static post(routePath: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)): Route
  public static post(routePath: string, options: RouterOptions, callback: string | ((client: Client, mongo: Mongo) => void | Response)): Route
  public static post(...args: any[]): Route {
    let callback = args.length == 3 ? args[2] : args[1]
    let r = new Route(path.join(...this.groupPath, args[0]), 'post', callback)
    r.setGroupOptions(Object.assign([], this.groupOptions))
    args.length == 3 && r.setRouteOptions(args[1])
    this.routes.push(r)
    return r
  }

  public static any(routePath: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)): Route
  public static any(routePath: string, options: RouterOptions, callback: string | ((client: Client, mongo: Mongo) => void | Response)): Route
  public static any(...args: any[]): Route {
    let callback = args.length == 3 ? args[2] : args[1]
    let r = new Route(path.join(...this.groupPath, args[0]), 'any', callback)
    r.setGroupOptions(Object.assign([], this.groupOptions))
    args.length == 3 && r.setRouteOptions(args[1])
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