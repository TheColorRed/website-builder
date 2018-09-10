import { loadPage } from '../helper';
import { $, tag } from '../../../util/elemental/Elemental';

async function goToPage(e: Event) {
  e.preventDefault()
  let target = e.currentTarget as HTMLAnchorElement
  let result = await loadPage(target.getAttribute('data-tpl') || '')
  if (!result) return
  window.history.pushState({}, '', target.href || '/')
  $(target).closest('ul').find('li').removeClass('active')
  $(target).closest('li').addClass('active')
}

export function mainNav(paths: RouteList) {
  return tag({
    tag: 'nav.main>ul',
    events: {
      $selector: {
        click: { selector: 'li > a', event: goToPage }
      }
    },
    children: [
      `li[class="${paths.when('admin-home', 'active')}"]>a[href="${paths.get('admin-home')}"][data-tpl="home"] #{i.fa-lg.fas.fa-fw.fa-home} Home`,
      `li[class="${paths.when('admin-pages', 'active')}"]>a[href="${paths.get('admin-pages')}"][data-tpl="pages"] #{i.fa-lg.fas.fa-fw.fa-columns} Pages`,
      {
        tag: `li[class="${paths.when('admin-media', 'active')}"]>a[href="${paths.get('admin-media')}"][data-tpl="media"]`,
        events: { $children: { click: goToPage } },
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
      `li[class="${paths.when('admin-themes', 'active')}"]>a[href="${paths.get('admin-themes')}"]
        #{i.fa-lg.fas.fa-fw.fa-palette} Themes`,
      `li[class="${paths.when('admin-components', 'active')}"]>a[href="${paths.get('admin-components')}"] #{i.fa-lg.fas.fa-fw.fa-puzzle-piece} Components`,
      `li[class="${paths.when('admin-plugins', 'active')}"]>a[href="${paths.get('admin-plugins')}"] #{i.fa-lg.fas.fa-fw.fa-plug} Plugins`,
      `li[class="${paths.when('admin-comments', 'active')}"]>a[href="${paths.get('admin-comments')}"] #{i.fa-lg.fas.fa-fw.fa-comments} Comments`,
      `li[class="${paths.when('admin-tools', 'active')}"]>a[href="${paths.get('admin-tools')}"] #{i.fa-lg.fas.fa-fw.fa-wrench} Tools`,
      `li[class="${paths.when('admin-settings', 'active')}"]>a[href="${paths.get('admin-settings')}"] #{i.fa-lg.fas.fa-fw.fa-cog} Settings`,
      `li[class="${paths.when('admin-trash', 'active')}"]>a[href="${paths.get('admin-trash')}"][data-tpl="trash"] #{i.fa-lg.fas.fa-fw.fa-trash-alt} Trash`,
      `li[class="${paths.when('admin-logout', 'active')}"]>a[href="${paths.get('admin-logout')}"] #{i.fa-lg.fas.fa-fw.fa-power-off} Logout`,
    ]
  })
}