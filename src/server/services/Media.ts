import { Mongo } from '../core'

/**
 * Gets a list of directories in the current directory
 *
 * @export
 * @param {string} path The current directory
 * @param {Mongo} mongo The mongo connection
 * @returns
 */
export async function directories(mongo: Mongo, path: string) {
  path = mongo.sanitize(path)
  let pathSize = path.split('/').filter(String).length
  return await mongo.aggregate('fs.files', [
    {
      $project: {
        path: {
          $filter: {
            input: { $split: ['$filename', '/'] },
            as: 'str',
            cond: { $ne: ['$$str', ''] }
          }
        }
      }
    },
    {
      $project: {
        path: {
          $slice: [
            '$path',
            { $subtract: [{ $size: '$path' }, 1] }
          ]
        }
      }
    },
    { $group: { _id: '$path' } },
    {
      $project: {
        fullPath: {
          $reduce: {
            input: '$_id',
            initialValue: '',
            in: {
              $concat: ['$$value', '/', '$$this']
            }
          }
        }
      }
    },
    {
      $match: {
        fullPath: RegExp('^' + path),
        [`_id.${pathSize}`]: { $exists: true }
      }
    },
    {
      $addFields: {
        nextDirectory: { $arrayElemAt: ['$_id', pathSize] },
        directory: {
          $reduce: {
            input: { $slice: ['$_id', 0, pathSize + 1] },
            initialValue: '',
            in: {
              $concat: ['$$value', '/', '$$this']
            }
          }
        }
      }
    },
    { $sort: { nextDirectory: 1 } }
  ])
}

export interface MediaFilter {
  items: string[]
  path: string
  query: string
}

/**
 * Gets a list of file in the current directory
 *
 * @export
 * @param {string} directory The current directory
 * @param {Mongo} mongo The mongo connection
 * @returns
 */
export async function files(mongo: Mongo, directory: string, filter?: MediaFilter) {
  return await mongo.aggregate('fs.files', [
    {
      $group: {
        _id: '$filename',
        size: { $sum: '$length' },
        files: { $sum: 1 },
        uploadDate: { $first: '$uploadDate' },
        metadata: { $first: '$metadata' }
      }
    }, {
      $addFields: {
        path: {
          $filter: {
            input: { $split: ['$_id', '/'] },
            as: 'str',
            cond: { $ne: ['$$str', ''] }
          }
        }
      }
    }, {
      $addFields: {
        path: { $slice: ['$path', { $subtract: [{ $size: '$path' }, 1] }] },
        file: { $arrayElemAt: ['$path', -1] }
      }
    }, {
      $addFields: {
        path: {
          $reduce: {
            input: '$path',
            initialValue: '',
            in: { $concat: ['$$value', '/', '$$this'] }
          }
        }
      }
    },
    {
      $match: {
        $expr: { $eq: ['$path', mongo.sanitize(directory)] },
        'metadata.type': filter && filter.items.length > 0 ? { $in: filter.items } : { $exists: true },
        file: filter && filter.query && filter.query.length > 0 ? RegExp(mongo.sanitize(filter.query), 'i') : { $exists: true }
      }
    },
    { $addFields: { filename: '$_id' } },
    { $project: { _id: 0 } }
  ])
}