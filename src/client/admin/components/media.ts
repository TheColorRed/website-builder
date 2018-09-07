import { loadPage } from '../templates/helper';

import { makeDirectoryListing, makeFileListing, makeFilter, makeBreadCrumbs } from '../templates/admin/media'
import { $ } from '../elemental/Elemental';
import { Element } from '../elemental/Element';
import { QueryBuilder } from '../../util/queryBuilder';

export interface DirectoryItem {
  directory: string
  fullPath: string
  nextDirectory: string
}

export interface FileItem {
  file: string
  filename: string
  files: number
  metadata: { mime: string, type: string, ext: string }
  path: string
  size: number
  uploadDate: string
}

export interface FileDatabaseItem {
  _id: string
  chunkSize: number
  filename: string
  length: number
  md5: string
  metadata: { mime: string, type: string, ext: string }
  uploadDate: string
}

export interface Listing {
  directories: DirectoryItem[]
  files: FileItem[]
}

let qb = queryBuilder as QueryBuilder

export function load() {
  !qb.get('path').match(/^\/media/) && qb.set('path', '/media')
  loadPage('media')
  makeFilter().render('#media-filters')
}

window.addEventListener('popstate', async e => {
  e.preventDefault()
  openDirectory(qb.get('path'))
})

export async function openDirectory(path: string) {
  if (!path) return
  $('#media-listings').ajax(routes.get('api-admin-media-files'), { path }, 'get', (data: Listing) => {
    qb.remove('file')
    updateState(path)
    return Element.join(
      makeBreadCrumbs(),
      makeDirectoryListing(data.directories),
      makeFileListing(data.files)
    )
  })
}

let updatingState = false

export function updateState(pathname?: string) {
  if (updatingState) return
  updatingState = true
  let types = getTypes()
  let query = getQuery()
  let p = pathname ? pathname : qb.get('path') || ''

  p.length > 0 && qb.set('path', p)
  query.length > 0 && qb.set('query', query)
  types.length > 0 && qb.set('types', types.join(','))
  history.pushState({}, '', qb.toString())

  updatingState = false
}

export function updateStateAndApplyFilter() {
  updateState()
  applyFilter()
}

export function applyFilter() {
  let types = getTypes()
  let query = getQuery()
  Array.from(document.querySelectorAll<HTMLElement>('.media-file')).forEach(row => {
    let type = row.getAttribute('data-type') || ''
    let file = row.getAttribute('data-file') || ''
    if (
      // query and media type filter
      (types.includes(type) && file.includes(query)) ||
      // query only filter
      (file.includes(query) && types.length == 0) ||
      // media type only filter
      (types.includes(type) && query.length == 0)) { row.classList.remove('hidden') }
    else { row.classList.add('hidden') }
  })
}

function getQuery() {
  let search = document.querySelector('.media-query-filter input') as HTMLInputElement
  return search ? search.value : ''
}

function getTypes() {
  let elements = Array.from(document.querySelectorAll<HTMLElement>('.media-filter'))
  return elements.map(el => el.classList.contains('active') ? el.getAttribute('data-type') : '').filter(String)
}

export function getPath() {
  let locationSearch = window.location.search.replace(/^\?/, '').split('&')
  let p = (locationSearch.find(i => i.startsWith('path=')) || '').match(/(.+?)=(.+)/)
  return p && p[2] ? p[2] : ''
}