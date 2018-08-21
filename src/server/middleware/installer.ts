import { Client } from '../core'

export function loadInstaller(client: Client) {
  let regexp = /^\/admin(\/api)?\/install*/
  // If the website hasn't been installed yet redirect to the install page
  if (!client.appStatus.installed && !regexp.test(client.path)) {
    return client.ajax ? client.response.json({}, 500) : client.response.redirect.to('install')
  }

  // If the website has been installed, and an install page is being accessed
  // Redirect to the home page
  else if (client.appStatus.installed && regexp.test(client.path)) {
    return client.ajax ? client.response.json({}, 500) : client.response.redirect.to('home')
  }

  // The application has been installed
  // The route isn't pointing to an install page
  return true
}