import { tag } from '../../elemental/Elemental';
import { Element } from '../../elemental/Element';
import { bytesToSize } from '../helper';
import { send } from '../../../util/ajax';

async function trashAction(e: Event) {
  // Array.from(document.querySelectorAll<HTMLElement>('.trash-delete, .trash-restore')).forEach(el => {
  e.preventDefault()
  let el = e.currentTarget as HTMLElement
  let dataEl = el.closest('[data-id]') as HTMLElement
  let spinner: HTMLElement | null = null
  if (dataEl) spinner = dataEl.querySelector('.spinner') as HTMLElement
  if (dataEl) {
    let id = dataEl.getAttribute('data-id')
    if (id && id.length > 0) {
      if (spinner) spinner.classList.remove('hidden')
      el.classList.add('hidden')
      let url = el.classList.contains('trash-delete') ? routes.get('api-admin-delete-media') : routes.get('api-admin-restore-media')
      await send(url, { id }, 'post')
      dataEl.remove()
    }
  }
}

export function makeTrash(files: any[]) {
  return tag([
    // '.well>.fluid.row>h1 Media File Trash',
    {
      tag: '.well',
      events: {
        $selector: { click: { selector: '.trash-restore', event: trashAction } }
      },
      children: [
        {
          render: files.length > 0,
          tag: 'p.row.text-bold',
          children: [
            'span.col-1.text-center Actions',
            'span.col-3 Filename',
            'span.col-2 Date Uploaded',
            'span.col-2 Date Deleted',
            'span.col-2 File Size'
          ]
        }, {
          render: files.length == 0,
          tag: 'div The trash is empty!'
        },
        Element.each(files, (row) => {
          return tag({
            tag: `p.row[data-id="${row.restore_id}"]`,
            children: [
              {
                tag: 'span.col-1.text-center',
                children: [
                  {
                    tag: 'span',
                    children: [
                      'a[title="Purge from trash"][href=""].trash-purge.light-blue-text.margin-horizontal-5>i.fa-lg.fa-fw.far.fa-times-circle.red-text',
                      'span.spinner.hidden.margin-horizontal-5>i.fa-lg.fa-fw.fas.fa-spin.fa-sync'
                    ]
                  },
                  {
                    tag: 'span',
                    children: [
                      'a[title="Restore from trash"][href=""].trash-restore.light-blue-text.margin-horizontal-5>i.fa-lg.fa-fw.fas.fa-undo-alt',
                      'span.spinner.hidden.margin-horizontal-5>i.fa-lg.fa-fw.fas.fa-spin.fa-sync'
                    ]
                  }
                ]
              },
              'span.col-3.overflow-ellipsis ' + row.data.filename,
              'span.col-2 ' + new Date(row.data.uploadDate).toLocaleString('en-US'),
              'span.col-2 ' + new Date(row.deleteDate).toLocaleString('en-US'),
              `span.col-2>span[title="${String(row.data.length).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Bytes"] ` + bytesToSize(row.data.length),
            ]
          })
        })
      ]
    }
  ])
}