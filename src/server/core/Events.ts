import { EventEmitter } from 'events'

export enum Events {
  // Application events
  UpdateAppStatus = 'update-app-status',
  // Database events
  UpdateMongoConnection = 'update-mongo-connection',
  MongoConnected = 'mongo-connected'
}

export const emitter = new EventEmitter