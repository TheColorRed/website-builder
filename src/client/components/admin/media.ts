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
  let listing = document.getElementById('data-listings') as HTMLElement
  if (listing) {
    let elements = Array.from(document.querySelectorAll<HTMLElement>('.media-filter'))
    let search = document.querySelector('.media-query-filter input') as HTMLInputElement

    new MutationObserver((mutationList) => {
      for (let mutation of mutationList) {
        mutation.addedNodes.forEach(node => {
          let el = node as HTMLElement
          el instanceof HTMLElement && Array.from(el.querySelectorAll<HTMLElement>('.directory-item')).forEach(item => {
            item.addEventListener('click', async function (e) {
              e.preventDefault()
              await openDirectory(this)
            })
          })
        })
      }
    }).observe(listing, { childList: true, subtree: true })
    let path = window.location.search.replace(/^\?/, '').split('&').find(i => i.startsWith('path=')) || ''
    openDirectory((path.split('=') || ['']).pop())

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
      let path = ''
      if (el instanceof HTMLElement) path = el.getAttribute('data-path') || ''
      else if (typeof el == 'string') path = el
      let data = await send<Listing>(FILES_URL, { path }, 'get')
      history.pushState({}, '', path ? '?path=' + path : '')
      makeListing(data)
    }

    function makeListing(data: Listing) {
      listing.innerHTML = ''
      let elementList: Tagger.Element[] = []
      if (data.directories.length > 0) {
        elementList.push(makeDirectoryHeader())
        elementList.push(makeDirectoryListing(data.directories))
      }
      if (data.files.length > 0) {
        elementList.push(makeFileHeader())
        elementList.push(makeFileListing(data.files))
      }
      Tag.join(...elementList).render(listing)
    }

    function makeDirectoryHeader() {
      return tag({
        tag: 'p.fluid.row.text-bold',
        children: [
          'span.col-1.text-center Actions',
          'span.col-3 Folder'
        ]
      })
    }

    function makeDirectoryListing(dirs: DirectoryItem[]) {
      return Tag.each(dirs, (dir: DirectoryItem) => {
        return tag({
          tag: 'p.fluid.row[data-directory=`${i.directory}`]',
          children: [
            {
              tag: 'span.col-1.text-center',
              children: {
                tag: 'span.margin-right-5',
                children: [
                  {
                    tag: 'a[title="Move to trash"][href=""].trash-delete.red-text',
                    children: 'i.fa-lg.fa-fw.far.fa-trash-alt'
                  },
                  {
                    tag: 'span.spinner.hidden',
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
        })
      })
    }

    function makeFileHeader() {
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
          }
        ]
      })
    }

    function makeFileListing(files: FileItem[]) {
      return tag({
        tag: '$frag',
        children: [
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
                visibility: () => $('.filter-count').dispatch('update')
              },
              children: [
                {
                  tag: 'span.col-1.text-center',
                  children: [
                    {
                      tag: 'span.margin-right-5',
                      children: {
                        tag: 'a[title="Move to trash"][href=""].trash-delete.red-text',
                        children: 'i.fa-lg.fa-fw.far.fa-trash-alt'
                      }
                    },
                    {
                      tag: 'span',
                      children: {
                        tag: 'a[href=`${i.filename}`][target="_blank"]',
                        children: 'i.fa-lg.fa-fw.far.fa-eye'
                      }
                    }
                  ]
                },
                {
                  tag: 'span.col-3.overflow-ellipsis',
                  children: `a[href='${FILE_URL}?file=${file.filename}'][title='${file.filename}'] ${file.file}`
                },
                `span.col-2 ${file.files}`,
                `span.col-2 ${bytesToSize(file.size)}`
              ]
            })
          })
        ]
      })
    }

    function applyFilter() {
      let types = getTypes()
      let query = getQuery()
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
      return window.location.search.replace(/^\?/, '').split('&').reduce((acc, val) => {
        let [k, v] = val.split('=', 2)
        return k == 'path' ? v : acc
      }, '') || '/media'
    }
  }
}