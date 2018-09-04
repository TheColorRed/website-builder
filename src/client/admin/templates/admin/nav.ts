function monkey() {
  console.log('i am a monkey')
}

export function mainNav() {
  return tag({
    tag: 'nav.main>ul',
    children: [
      'li.active>a[href=""][e:click:hover="monkey"] #{i.fa-lg.fas.fa-fw.fa-home} Home',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-columns} Pages',
      {
        tag: 'li>a[href=""]',
        children: [
          {
            tag: 'span.fa-layers.fa-fw.fa-lg',
            children: [
              'i.fas.fa-music[data-fa-transform="down-3 right-3"]',
              'i.fas.fa-camera[data-fa-transform="up-3 left-3"]',
            ]
          },
          'span Media'
        ]
      },
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-palette} Themes',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-puzzle-piece} Components',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-plug} Plugins',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-comments} Comments',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-wrench} Tools',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-cog} Settings',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-trash-alt} Trash',
      'li>a[href=""] #{i.fa-lg.fas.fa-fw.fa-power-off} Logout',
    ]
  })
}