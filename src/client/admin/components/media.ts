import { loadPage } from '../templates/helper';

import { makeDirectoryListing, makeFileListing, makeFilter } from '../templates/admin/media'
import { $ } from '../elemental/Elemental';
import { Element } from '../elemental/Element';

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

let path: string

export function load() {
  loadPage('media')

  let locationSearch = window.location.search.replace(/^\?/, '').split('&')
  let p = (locationSearch.find(i => i.startsWith('path=')) || '').match(/(.+?)=(.+)/)
  path = p && p[2] ? p[2] : ''
  makeFilter().render('#media-filters')
  openDirectory(path)
}

window.addEventListener('popstate', async e => {
  e.preventDefault()
  let path = window.location.search.replace(/^\?/, '').split('&').find(i => i.startsWith('path='))
  if (path) path = path.split('=').pop()
  path && openDirectory(path)
})

export async function openDirectory(path: string) {
  $('#media-listings').ajax(routes.get('api-admin-media-files'), { path }, 'get', (data: Listing) => {
    updateState(path)
    return Element.join(
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
  let f = []
  let p = pathname ? pathname : path || ''

  p.length > 0 && f.push(`path=${p}`)
  query.length > 0 && f.push(`query=${query}`)
  types.length > 0 && f.push(`types=${types.join(',')}`)
  history.pushState({}, '', (f.length > 0 ? '?' : window.location.pathname) + f.join('&'))
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