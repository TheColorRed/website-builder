import * as fs from 'fs'

export declare type KeyValuePair<T = any> = { [key: string]: T }

/**
 * Reads the contents of a file
 *
 * @export
 * @param {string} path
 * @returns
 */
export async function readFile(path: string) {
  return new Promise<string>(resolve => {
    fs.readFile(path, (err, data) => {
      resolve(data.toString())
    })
  })
}

/**
 * Reads the contents of a file and converts the json to an object
 *
 * @export
 * @template T
 * @param {string} path
 * @returns
 */
export async function readJson<T extends object>(path: string) {
  return new Promise<T>(resolve => {
    fs.readFile(path, (err, data) => {
      resolve(JSON.parse(data.toString()))
    })
  })
}

/**
 * Takes an object and converts it to json
 *
 * @export
 * @param {string} path
 * @param {object} data
 * @returns
 */
export async function writeToJson(path: string, data: object) {
  return new Promise<boolean>(resolve => {
    fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
      resolve(!!!err)
    })
  })
}

export async function updateJsonFile(path: string, key: string, value: any) {
  return new Promise<boolean>(async resolve => {
    let json = await readJson<KeyValuePair>(path)
    json[key] = value
    resolve(await writeToJson(path, json))
  })
}

/**
 * Writes a string to a file
 *
 * @export
 * @param {string} path
 * @param {object} data
 * @returns
 */
export async function writeFile(path: string, data: object) {
  return new Promise<boolean>(resolve => {
    fs.writeFile(path, data, (err) => {
      resolve(!!!err)
    })
  })
}
