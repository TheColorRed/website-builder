import { UrlWithStringQuery } from 'url'
import * as path from 'path'
import { Client } from './Client'
import { Response } from '.'
import { Mongo } from './Mongo'

export type requestMethod = 'get' | 'post' | 'any'

export interface route {
  path: string,
  method: requestMethod
  name?: string
  callback: string | ((client: Client, mongo: Mongo) => void | Response)
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
    this.routes.push({
      path,
      method: 'get',
      callback
    })
  }

  public static post(path: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)) {
    this.routes.push({
      path,
      method: 'post',
      callback
    })
  }

  public static any(path: string, callback: string | ((client: Client, mongo: Mongo) => void | Response)) {
    this.routes.push({
      path,
      method: 'any',
      callback
    })
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