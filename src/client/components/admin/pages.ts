interface Page {
  _id: string
  title: string
  createDate: Date
  updateDate: Date
  path: string
}
namespace builder.pages {
  declare const PAGES_URL: string
  if (typeof PAGES_URL == 'string') {
    send<Page[]>(PAGES_URL).then(pages => {
      tag({
        tag: '$frag',
        children: [
          {
            tag: 'p.fluid.row.text-bold',
            children: [
              'span.col-1.text-center Actions',
              'span.col-2 Title',
              'span.col-2 path',
              'span.col-2 Created',
              'span.col-2 Updated'
            ]
          },
          Tag.each(pages, (page) => {
            return tag({
              tag: `p.fluid.row[data-page=${page.path}]`,
              children: [
                {
                  tag: `span.col-1.text-center`,
                  children: [
                    {
                      tag: `a[href=''].margin-horizontal-5`,
                      children: 'i.fa-lg.fa-fw.far.fa-edit'
                    },
                    {
                      tag: `a[href='${page.path}'][target='_blank'].margin-horizontal-5`,
                      children: 'i.fa-lg.fa-fw.far.fa-eye'
                    },
                    {
                      tag: `a[href=''].margin-horizontal-5.red-text`,
                      children: 'i.fa-lg.fa-fw.far.fa-trash-alt',
                      events: {
                        click(e) {
                          e.preventDefault()
                          $(this).closest('.row').broadcast('spinnerTrash hideTrash')
                        },
                        hideTrash() { $(this).addClass('hidden') }
                      }
                    },
                    {
                      tag: `span.spinner.margin-horizontal-5.hidden`,
                      children: 'i.fa-lg.fa-fw.fas.fa-spin.fa-sync',
                      events: {
                        spinnerTrash() { $(this).removeClass('hidden') }
                      }
                    }
                  ]
                },
                `span.col-2 ${page.title}`,
                `span.col-2 ${page.path}`,
                `span.col-2 ${new Date(page.createDate).toLocaleString('en-US')}`,
                `span.col-2 ${new Date(page.updateDate).toLocaleString('en-US')}`
              ]
            })
          })
        ]
      }).render('#pages')
    })
  }
}