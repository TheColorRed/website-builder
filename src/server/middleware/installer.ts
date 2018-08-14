import { Client, response } from '../util'

export function loadInstaller(client: Client) {
  let regexp = /^(\/api)?\/install*/
  // If the website hasn't been installed yet redirect to the install page
  if (!client.appStatus.installed && !regexp.test(client.path)) {
    return client.ajax ? response().json({}, 500) : response().redirect.to('install')
  }

  // If the website has been installed, and an install page is being accessed
  // Redirect to the home page
  else if (client.appStatus.installed && regexp.test(client.path)) {
    return client.ajax ? response().json({}, 500) : response().redirect.to('home')
  }

  // The application has been installed
  // The route isn't pointing to an install page
  return true
}