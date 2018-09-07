import { $, tag } from '../elemental/Elemental';
import { Listing, FileDatabaseItem } from '../components/media';
import { makeFilter, makeDirectoryListing, makeFileListing, makeBreadCrumbs, makeFileDetails } from './admin/media';
import { Element } from '../elemental/Element';
import { makePage, Page } from './admin/pages';
import { makeHome } from './admin/home';
import { makeTrash } from './admin/trash';

export function loadPage(page: string) {
  switch (page) {
    case 'home':
      makeHome().render('#primary-content')
      return true
    case 'media':
      if (!!queryBuilder.get('file')) {
        $('#primary-content').ajax(routes.get('api-admin-media-file'), { file: queryBuilder.get('file') }, (data: FileDatabaseItem[]) => {
          return Element.join(makeFilter(), tag({
            tag: '.well#media-listings',
            children: [
              makeBreadCrumbs(),
              makeFileDetails(data)
            ]
          }))
        })
      } else {
        $('#primary-content').ajax(routes.get('api-admin-media-files'), { path: queryBuilder.get('path') }, (data: Listing) => {
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
      $('#primary-content').ajax(routes.get('api-admin-pages'), (data: Page[]) => makePage(data))
      return true
    case 'trash':
      $('#primary-content').ajax(routes.get('api-admin-trash'), (data: Page[]) => {
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