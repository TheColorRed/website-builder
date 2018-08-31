import { Client, Mongo } from '../../core'

export function main(client: Client) {
  return client.response.render('admin', 'pages')
}

export async function pages(client: Client, mongo: Mongo) {
  let pages = await mongo.aggregate('pages', [
    { $sort: { title: -1 } },
    { $project: { _id: 1, title: 1, createDate: 1, updateDate: 1, path: 1 } }
  ])
  return client.response.json(await pages.toArray())
}