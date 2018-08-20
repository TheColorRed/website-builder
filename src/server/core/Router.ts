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
  private _path!: UrlWithStringQuery
  public routeOptions: RouterOptions = {}
  public groupOptions: RouterOptions[] = []

  public get routeName() { return this._name }
  public get path(): string {
    if (typeof this.pathAlias == 'string' && !this.pathAlias.split('/').find(i => i.startsWith(':'))) return this.pathAlias
    return this._path.pathname || '/'
  }

  public constructor(
    public readonly pathAlias: string | RegExp,
    public readonly method: requestMethod,
    public readonly callback: string | ((client: Client, mongo: Mongo) => void | Response)
  ) {
    if (typeof this.pathAlias == 'string') {
      this.pathAlias = this.pathAlias.replace(/\\/g, '/').replace(/\/$/g, '')
      if (!this.pathAlias.startsWith('/')) this.pathAlias = '/' + this.pathAlias
    }
    let isAlreadyRoute = !!Router.findByAlias(this.method, String(this.pathAlias))
    if (isAlreadyRoute) throw new Error(`Path already exists: "${String(this.pathAlias)}"`)
    let display = this.pathAlias instanceof RegExp ? `RegExp(${this.pathAlias.source})` : this.pathAlias
    console.log(`    ${method.padEnd(4, ' ')} ${display}`)
  }

  public get params(): { [key: string]: string } {
    let returnParams: { [key: string]: string } = {}
    if (this.pathAlias instanceof RegExp) return {}
    let crumbs = this.pathAlias.split('/').filter(i => i.trim().length > 0)
    let pathCrumbs = this.path.split('/').filter(i => i.trim().length > 0)
    let params = crumbs
      .map((i, idx) => { return { idx, val: i.startsWith(':') ? i : '' } })
      .filter(i => i.val.length > 0)
    params.forEach(p => {
      returnParams[p.val.replace(':', '')] = pathCrumbs[p.idx]
    })
    // console.log(this.route.path, this.route.pathAlias)
    return Object.freeze(returnParams)
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

  public setPath(path: UrlWithStringQuery) {
    this._path = path
  }
}

export type RouteCallback = string | ((client: Client, mongo: Mongo) => void | Response | Promise<Response> | Promise<void>)

export class Router {

  private static readonly routes: Route[] = []
  private static readonly groupPath: string[] = []
  private static readonly groupOptions: RouterOptions[] = []

  public static async route(route: UrlWithStringQuery, client: Client, mongo: Mongo): Promise<Response | null> {
    // Try to find the route
    let theRoute = this._find(route, <requestMethod>client.method || 'get')

    if (theRoute) client.setRoute(theRoute)

    let callback

    // Execute the middleware that is attached to the route
    if (theRoute) {
      // Test the group middleware
      for (let c of theRoute.groupOptions) {
        if (!c.middleware) continue
        let result = this._runMiddleware(c.middleware, client)
        if (result instanceof Response) return result
      }
      // Test the route specific middleware
      if (theRoute.routeOptions.middleware) {
        let result = this._runMiddleware(theRoute.routeOptions.middleware, client)
        if (result instanceof Response) return result
      }
    }

    // If the callback is a string load the module from the controllers
    // Then get the function in the file
    try {
      if (theRoute && typeof theRoute.callback == 'string') {
        let [controller, method] = theRoute.callback.split('@')
        if (controller && method && controller.length > 0 && method.length > 0) {
          let module = await import(path.join(__dirname, '../controllers', controller))
          callback = module[method]
        }
      } else if (theRoute && typeof theRoute.callback == 'function') {
        callback = theRoute.callback
      }
    } catch (e) { }

    // If a valid route was found run the callback, otherwise send a 404
    return callback ? await callback(client, mongo) : null
  }

  public static group(path: string, callback: Function): void
  public static group(path: string, options: RouterOptions, callback: Function): void
  public static group(...args: any[]): void {
    let path = args[0] as string
    let callback = args.length == 3 ? args[2] : args[1]
    this.groupOptions.push(args.length == 3 ? args[1] : {})
    this.groupPath.push(path)
    callback()
    this.groupPath.pop()
    this.groupOptions.pop()
  }

  public static get(callback: RouteCallback): Route
  public static get(routePath: string | RegExp, callback: RouteCallback): Route
  public static get(routePath: string | RegExp, options: RouterOptions, callback: RouteCallback): Route
  public static get(...args: any[]): Route {
    return this.createRoute('get', ...args)
  }

  public static post(callback: RouteCallback): Route
  public static post(routePath: string, callback: RouteCallback): Route
  public static post(routePath: string, options: RouterOptions, callback: RouteCallback): Route
  public static post(...args: any[]): Route {
    return this.createRoute('post', ...args)
  }

  public static any(callback: RouteCallback): Route
  public static any(routePath: string, callback: RouteCallback): Route
  public static any(routePath: string, options: RouterOptions, callback: RouteCallback): Route
  public static any(...args: any[]): Route {
    return this.createRoute('any', ...args)
  }

  private static createRoute(method: requestMethod, ...args: any[]) {
    // Get the route callback
    let callback = null
    // only one parameter
    if (args.length == 1) callback = args[0]
    // More than one parameter
    else callback = args.length == 3 ? args[2] : args[1]

    // Get the route path
    let routePath = args.length > 1 ? args[0] : '/'

    // Create the new route
    let r: Route
    if (routePath instanceof RegExp) {
      r = new Route(routePath, method, callback)
    } else {
      r = new Route(path.join(...this.groupPath, routePath), method, callback)
    }
    r.setGroupOptions(Object.assign([], this.groupOptions))
    args.length == 3 && r.setRouteOptions(args[1])

    // Add the route to the list of routes
    this.routes.push(r)
    return r
  }

  public static findByName(name: string) {
    return this.routes.find(r => r.routeName == name)
  }

  public static findByAlias(method: requestMethod, path: string) {
    return this.routes.find(r => r.method == method && String(r.pathAlias) == path)
  }

  public static findByPath(method: requestMethod, path: string) {
    return this.routes.find(r => r.method == method && r.path == path)
  }

  private static _runMiddleware(middleware: Function[], client: Client) {
    for (let i of middleware) {
      let result = i(client)
      if (result instanceof Response) return result
      if (!result) return response().send500()
    }
    return true
  }

  private static _find(route: UrlWithStringQuery, method: requestMethod) {
    if (!route.pathname) return undefined
    // Find routes based on exact match
    let theRoute = this.routes.find(r => {
      if (typeof r.pathAlias == 'string')
        return r.pathAlias == route.pathname && method.toLowerCase() == r.method.toLowerCase()
      else if (r.pathAlias instanceof RegExp)
        return r.pathAlias.test(route.pathname || '')
      return false
    })
    // If no exact match was found
    if (!theRoute) {
      let routeCrumbs = route.pathname.split('/').filter(i => i.trim().length > 0)
      let routeDynParams = routeCrumbs.filter(i => i.startsWith(':'))
      let routeLen = routeCrumbs.length
      let routeDynParamsLen = routeDynParams.length

      for (let r of this.routes) {
        if (r.pathAlias instanceof RegExp) break
        let crumbs = r.pathAlias.split('/').filter(i => i.trim().length > 0)
        let dynParams = crumbs.filter(i => i.startsWith(':'))
        // make sure the path lengths are the same and parameters exist
        if (dynParams.length == 0 || (routeLen != crumbs.length && routeDynParamsLen != dynParams.length)) continue
        // Make sure the methods are the same (get, post, etc.)
        if (r.method.toLowerCase() != method.toLowerCase()) continue
        // Make sure non-parameters are in the correct location
        if (!crumbs.every((crumb, idx) => routeCrumbs[idx] == crumb || crumb.startsWith(':'))) continue
        // Create a new instance of the route
        theRoute = Object.assign(Object.create(r), r) as Route
        // Set the current path of the route
        theRoute instanceof Route && theRoute.setPath(route)
        break
      }
    }

    if (theRoute) {
      theRoute = <Route>Object.create(theRoute)
      theRoute.setPath(route)
    }
    return theRoute
  }
}