import { Listing, FileDatabaseItem } from '../components/media';
import { makeFilter, makeDirectoryListing, makeFileListing, makeBreadCrumbs, makeFileDetails } from './admin/media';
import { makePage, Page } from './admin/pages';
import { makeHome } from './admin/home';
import { makeTrash } from './admin/trash';
import { globalQuery } from '../../util/queryBuilder';
import { routes } from '../../util/routes';
import { Element } from '../../util/elemental/Element';
import { $, tag } from '../../util/elemental/Elemental';

export async function loadPage(page: string) {
  switch (page) {
    case 'home':
      makeHome().render('#primary-content')
      return true
    case 'media':
      if (!!globalQuery.get('file')) {
        await $('#primary-content').ajax(routes.get('api-admin-media-file'), { file: globalQuery.get('file') }, (data: FileDatabaseItem[]) => {
          return Element.join(makeFilter(), tag({
            tag: '.well#media-listings',
            children: [
              makeBreadCrumbs(),
              makeFileDetails(data)
            ]
          }))
        })
      } else {
        await $('#primary-content').ajax(routes.get('api-admin-media-files'), { path: globalQuery.get('path') }, (data: Listing) => {
          return Element.join(makeFilter(), tag({
            tag: '.well#media-listings',
            children: [
              makeBreadCrumbs(),
              makeDirectoryListing(data.directories),
              makeFileListing(data.files)
            ]
          }))
        })
      }
      return true
    case 'pages':
      await $('#primary-content').ajax(routes.get('api-admin-pages'), (data: Page[]) => makePage(data))
      return true
    case 'trash':
      await $('#primary-content').ajax(routes.get('api-admin-trash'), (data: Page[]) => {
        return makeTrash(data)
      })
      return true
  }
  return false
}


export function bytesToSize(bytes: number) {
  if (bytes / 1024 / 1024 / 1024 / 1024 / 1024 > 1)
    return (bytes / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' PB'
  else if (bytes / 1024 / 1024 / 1024 / 1024 > 1)
    return (bytes / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB'
  else if (bytes / 1024 / 1024 / 1024 > 1)
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  else if (bytes / 1024 / 1024 > 1)
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  else if (bytes / 1024 > 1)
    return (bytes / 1024).toFixed(2) + ' KB'
  else
    return bytes + ' Bytes'
}