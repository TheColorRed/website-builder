interface DirectoryItem {
  directory: string
  fullPath: string
  nextDirectory: string
}

interface FileItem {
  file: string
  filename: string
  files: number
  metadata: { mime: string, type: string, ext: string }
  path: string
  size: number
  uploadDate: string
}

interface Listing {
  directories: DirectoryItem[]
  files: FileItem[]
}

namespace builder {

  declare const FILE_URL: string
  declare const FILES_URL: string
  declare const TRASH_URL: string

  let listing = document.getElementById('data-listings') as HTMLElement
  if (listing) {
    let elements = Array.from(document.querySelectorAll<HTMLElement>('.media-filter'))
    let search = document.querySelector('.media-query-filter input') as HTMLInputElement

    let locationSearch = window.location.search.replace(/^\?/, '').split('&')
    let p = (locationSearch.find(i => i.startsWith('path=')) || '').match(/(.+?)=(.+)/)
    let path = p && p[2] ? p[2] : ''
    let query = (locationSearch.find(i => i.startsWith('query=')) || '').match(/(.+?)=(.+)/)
    if (query && query[2]) { search.value = query[2] }
    openDirectory(path)

    search && search.addEventListener('input', e => {
      e.preventDefault()
      applyFilter()
    })
    elements.forEach(el => {
      el.addEventListener('click', function (e) {
        e.preventDefault()
        this.classList.toggle('active')
        applyFilter()
      })
    })

    window.addEventListener('popstate', async e => {
      e.preventDefault()
      let path = window.location.search.replace(/^\?/, '').split('&').find(i => i.startsWith('path='))
      if (path) path = path.split('=').pop()
      let data = await send<Listing>(FILES_URL, { path }, 'get')
      makeListing(data)
    })

    async function openDirectory(el?: HTMLElement | string) {
      if (el instanceof HTMLElement) path = el.getAttribute('data-path') || ''
      else if (typeof el == 'string') path = el
      let data = await send<Listing>(FILES_URL, { path }, 'get')
      updateState()
      makeListing(data)
    }

    function makeListing(data: Listing) {
      listing.innerHTML = ''
      let elementList: Tagger.Element[] = []
      if (data.directories.length > 0) {
        elementList.push(makeDirectoryListing(data.directories))
      }
      if (data.files.length > 0) {
        elementList.push(makeFileListing(data.files))
      }
      Tag.join(...elementList).render(listing)
    }

    function makeDirectoryListing(dirs: DirectoryItem[]) {
      return Tag.each(dirs, (dir: DirectoryItem) => {
        return tag({
          tag: '$frag',
          children: [
            // Listing header
            {
              tag: 'p.fluid.row.text-bold',
              children: [
                'span.col-1.text-center Actions',
                'span.col-3 Folder'
              ]
            },
            // Listing rows
            {
              tag: `p.fluid.row[data-directory=${dir.directory}]`,
              children: [
                {
                  tag: 'span.col-1.text-center',
                  children: {
                    tag: 'span.margin-horizontal-5',
                    children: [
                      // Trash
                      {
                        tag: 'a[title="Move to trash"][href=""].trash-delete.red-text',
                        events: {
                          async click(e) {
                            e.preventDefault()
                            let row = this.closest('p.row')
                            if (row) {
                              let directory = row.getAttribute('data-directory')
                              $(this).addClass('hidden').closest('.row').find('.spinner').dispatch('spin')
                              await send(TRASH_URL, { directory }, 'post')
                              $(this).closest('.row').remove()
                            }
                          }
                        },
                        children: 'i.fa-lg.fa-fw.far.fa-trash-alt'
                      },
                      // Trash spinner
                      {
                        tag: 'span.spinner.hidden',
                        events: {
                          spin() { $(this).removeClass('hidden') }
                        },
                        children: 'i.fa-lg.fa-fw.fas.fa-spin.fa-sync'
                      }
                    ]
                  }
                },
                {
                  tag: 'span.col-3.overflow-ellipsis',
                  events: {
                    children: {
                      click(e) {
                        e.preventDefault()
                        openDirectory(this)
                      }
                    }
                  },
                  children: `a.directory-item[href='?path=${dir.directory}'][data-path='${dir.directory}'][title='${dir.nextDirectory}'] ${dir.nextDirectory}`
                }
              ]
            }
          ]
        })
      })
    }

    function makeFileListing(files: FileItem[]) {
      return tag({
        tag: '$frag',
        children: [
          {
            tag: 'p.fluid.row.text-bold',
            children: [
              'span.col-1.text-center Actions',
              'span.col-3 Filename',
              'span.col-2 Number of Files',
              'span.col-2 Size of Files'
            ]
          },
          {
            tag: 'p.fluid.row',
            children: {
              tag: `span.col-12.filter-count`,
              events: {
                loaded: () => $('.filter-count').dispatch('update'),
                update() {
                  applyFilter()
                  let hidden = $('.media-file.hidden').count()
                  if (hidden > 0) {
                    this.parentElement && this.parentElement.classList.remove('hidden')
                    if (hidden == 1) this.textContent = `${hidden} file has`
                    else this.textContent = `${hidden} files have`
                    this.textContent += ' been hidden with this filter'
                  }
                  else this.parentElement && this.parentElement.classList.add('hidden')
                }
              }
            }
          },
          Tag.each(files, (file) => {
            return tag({
              tag: `p.fluid.row.media-file[data-filename='${file.filename}'][data-file='${file.file}'][data-type='${file.metadata.type}']`,
              events: {
                // Row visibility changed
                visibility: () => $('.filter-count').dispatch('update')
              },
              children: [
                {
                  tag: 'span.col-1.text-center',
                  children: [
                    // Trash
                    {
                      tag: 'span',
                      children: {
                        tag: 'a[title="Move to trash"][href=""].trash-delete.red-text.margin-horizontal-5',
                        events: {
                          async click(e) {
                            e.preventDefault()
                            let row = this.closest('p.row')
                            if (row) {
                              let file = row.getAttribute('data-filename')
                              $(this).addClass('hidden').closest('.row').find('.spinner, .preview').dispatch('spin hide')
                              await send(TRASH_URL, { file }, 'post')
                              $(this).closest('.row').remove()
                            }
                          }
                        },
                        children: 'i.fa-lg.fa-fw.far.fa-trash-alt'
                      }
                    },
                    // Spinner
                    {
                      tag: 'span.spinner.hidden.margin-horizontal-5',
                      events: {
                        spin() { $(this).removeClass('hidden') }
                      },
                      children: 'i.fa-lg.fa-fw.fas.fa-spin.fa-sync'
                    },
                    // Preview
                    {
                      tag: 'span.preview',
                      events: {
                        hide() { $(this).addClass('hidden') }
                      },
                      children: {
                        tag: `a[href=${file.filename}][target="_blank"].margin-horizontal-5`,
                        children: 'i.fa-lg.fa-fw.far.fa-eye'
                      }
                    }
                  ]
                },
                // Filename
                {
                  tag: 'span.col-3.overflow-ellipsis',
                  children: `a[href='${FILE_URL}?file=${file.filename}'][title='${file.filename}'] ${file.file}`
                },
                // Number of files
                `span.col-2 ${file.files}`,
                // Size of all files
                `span.col-2 ${bytesToSize(file.size)}`
              ]
            })
          })
        ]
      })
    }

    let t: number = -1
    let updatingState = false

    function updateState() {
      if (updatingState) return
      updatingState = true
      let types = getTypes()
      let query = getQuery()
      let f = []
      path.length > 0 && f.push(`path=${path}`)
      query.length > 0 && f.push(`query=${query}`)
      types.length > 0 && f.push(`query=${types.join(',')}`)
      history.pushState({}, '', (f.length > 0 ? '?' : window.location.pathname) + f.join('&'))
      updatingState = false
    }

    function applyFilter() {
      let types = getTypes()
      let query = getQuery()
      clearTimeout(t)
      t = <any>setTimeout(() => {
        updateState()
        Array.from(listing.querySelectorAll<HTMLElement>('.media-file')).forEach(row => {
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
      }, 300)
    }

    function bytesToSize(bytes: number) {
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

    function getQuery() {
      return search ? search.value : ''
    }

    function getTypes() {
      return elements.map(el => el.classList.contains('active') ? el.getAttribute('data-type') : '').filter(String)
    }

    function getPath() {
      let locationSearch = window.location.search.replace(/^\?/, '').split('&')
      let p = (locationSearch.find(i => i.startsWith('path=')) || '').match(/(.+?)=(.+)/)
      return p && p[2] ? p[2] : ''
      //   .reduce((acc, val) => {
      //   let [k, v] = val.split('=', 2)
      //   return k == 'path' ? v : acc
      // }, '') || '/media'
    }
  }
}