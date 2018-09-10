import { DirectoryItem, openDirectory, FileItem, FileDatabaseItem, updateStateAndApplyFilter, updateState } from '../../components/media';
import { send } from '../../../util/ajax';
import { bytesToSize } from '../helper';
import { globalQuery } from '../../../util/queryBuilder';
import { $, tag } from '../../../util/elemental/Elemental';
import { Element } from '../../../util/elemental/Element';
import { routes } from '../../../util/routes';

export function makeFilter() {
  let inputInterval = -1
  return tag({
    children: [
      {
        tag: '.fluid.row',
        children: [
          {
            tag: '.col.media-query-filter',
            children: [
              {
                tag: 'input[type="text"][placeholder="Search"]',
                events: {
                  input(e) {
                    e.preventDefault()
                    clearTimeout(inputInterval)
                    inputInterval = <number><any>setTimeout(updateStateAndApplyFilter, 300)
                  },
                  loaded() {
                    let input = this as HTMLInputElement
                    let locationSearch = window.location.search.replace(/^\?/, '').split('&')
                    let p = (locationSearch.find(i => i.startsWith('query=')) || '').match(/(.+?)=(.+)/)
                    input.value = (p && p[2] ? p[2] : '').trim()
                    updateStateAndApplyFilter()
                  }
                }
              },
              'i.fas.fa-search.fa-3x'
            ]
          }
        ]
      },
      {
        tag: '.fluid.row',
        events: {
          $children: {
            click(e) {
              e.preventDefault()
              $(this).toggleClass('active')
              updateStateAndApplyFilter()
            }
          }
        },
        children: [
          'a[href=""][data-type="image"].col.media-filter.image-filter Images',
          'a[href=""][data-type="video"].col.media-filter.video-filter Videos',
          'a[href=""][data-type="audio"].col.media-filter.audio-filter Audio',
          'a[href=""][data-type="font"].col.media-filter.compress-filter Fonts',
          'a[href=""][data-type="application"].col.media-filter.other-filter Apps'
        ]
      }
    ]
  })
}

// function getPath() {
//   let locationSearch = window.location.search.replace(/^\?/, '').split('&')
//   let p = (locationSearch.find(i => i.startsWith('path=')) || '').match(/(.+?)=(.+)/)
//   return (p && p[2] ? p[2] : '').split('/')
// }

function clickBreadcrumb(this: HTMLElement, e: Event) {
  e.preventDefault()
  let path = this.getAttribute('data-path')
  openDirectory(path || '')
}

export function makeBreadCrumbs() {
  let path = globalQuery.get('path')
  let file = globalQuery.get('file')
  let hasPath = !!path
  let hasFile = !!file
  return tag({
    tag: 'ul.breadcrumbs',
    events: {
      $selector: {
        click: { selector: 'li > a', event: clickBreadcrumb }
      }
    },
    children: [
      {
        render: !hasPath && !hasFile,
        tag: 'li>strong media'
      },
      Element.each((hasFile ? file : path).split('/').filter(String), (crumb, idx, arr) => {
        if ((idx < arr.length - 1 && arr.length > 1) || hasFile) {
          if (hasFile && idx == arr.length - 1) {
            return tag([`li>strong ${crumb}`])
          }
          return tag([`li>a[href=""][data-path="/${arr.slice(0, idx + 1).join('/')}"] ${crumb}`])
        }
        return tag([`li>strong ${crumb}`])
      })
    ]
  })
}

export function makeDirectoryListing(dirs: DirectoryItem[]) {
  return tag([
    // Listing header
    {
      tag: 'p.fluid.row.text-bold',
      render: dirs.length > 0,
      children: [
        'span.col-1.text-center Actions',
        'span.col-3 Folder'
      ]
    },
    Element.each(dirs, dir => {
      return tag({
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
                        $(this).addClass('hidden').closest('.row').broadcast('spin')
                        await send(routes.get('api-admin-delete-media'), { directory }, 'post')
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
          // Directory name
          {
            tag: 'span.col-3.overflow-ellipsis',
            events: {
              $children: {
                click(e) {
                  e.preventDefault()
                  let path = this.getAttribute('data-path') || ''
                  openDirectory(path)
                }
              }
            },
            children: `a.directory-item[href='?path=${dir.directory}'][data-path='${dir.directory}'][title='${dir.nextDirectory}'] ${dir.nextDirectory}`
          }
        ]
      })
    })
  ])
}

export function makeFileListing(files: FileItem[]) {
  return tag({
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
              // applyFilter()
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
      Element.each(files, (file) => {
        return tag({
          tag: `p.fluid.row.media-file.middle[data-filename='${file.filename}'][data-file='${file.file}'][data-type='${file.metadata.type}']`,
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
                          $(this).addClass('hidden').closest('.row').broadcast('spin hide')
                          await send(routes.get('api-admin-delete-media'), { file }, 'post')
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
              tag: 'span.col-3.overflow-ellipsis.middle[style="height: 32px"]',
              events: {
                $children: {
                  click(e) {
                    e.preventDefault()
                    $('#media-listings').ajax(routes.get('api-admin-media-file'), { file: file.filename }, (data: FileDatabaseItem[]) => {
                      globalQuery.set('file', file.filename)
                      updateState()
                      return tag([
                        makeBreadCrumbs(),
                        makeFileDetails(data)
                      ])
                    })
                  }
                }
              },
              children: {
                tag: `a.middle.inline-flex[href='${routes.get('api-admin-media-file')}?file=${file.filename}'][title='${file.filename}']`,
                children: [
                  {
                    tag: `span.margin-right-5.center[style="width: 32px"]`,
                    children: {
                      render: file.metadata.type == 'image',
                      tag: `img[src="${file.filename}?h=32"][style="max-width: 32px"]`
                    }
                  }, {
                    tag: 'span',
                    txt: file.file
                  }
                ]
              }
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

export function makeFileDetails(files: FileDatabaseItem[]) {
  return tag([
    {
      render: files.length > 0,
      tag: 'p.fluid.row.text-bold',
      children: [
        'span.col-1.text-center Actions',
        'span.col-1.text-center Info',
        'span.col-2 Date Uploaded',
        'span.col-2 File Size'
      ]
    },
    Element.each(files, (file, index) => {
      return tag({
        tag: `p.fluid.row[data-id=${file._id}]`,
        children: [
          // Delete file
          {
            tag: 'span.col-1.text-center',
            children: {
              tag: 'span.margin-right-5',
              children: [
                {
                  tag: `a[title="Move to trash"][href=''].trash-delete.red-text`,
                  children: 'i.fa-lg.fa-fw.far.fa-trash-alt'
                },
                {
                  tag: 'span.spinner.hidden',
                  children: 'i.fa-lg.fa-fw.fas.fa-spin.fa-sync'
                }
              ]
            }
          },
          // Spinner
          {
            tag: 'span.col-1.text-center',
            children: {
              render: index == 0,
              tag: 'span.label.label-info current'
            }
          },
          // Upload date
          `span.col-2 ${new Date(file.uploadDate).toLocaleString('en-US')}`,
          // File size
          `span.col-2[title=${String(file.length).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Bytes] ${bytesToSize(file.length)}`
        ]
      })
    })
  ])
}