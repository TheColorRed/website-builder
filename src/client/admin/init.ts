import { submit, send } from '../util/ajax';
import { mainNav } from './templates/admin/nav';
import { routes } from '../util/routes';

Array.from(document.querySelectorAll<HTMLFormElement>('form.ajax')).forEach(form => {
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    let data = await submit(this)
    if (this.hasAttribute('callback')) {
      let callback = this.getAttribute('callback') as string
      (<any>builder)[callback](data)
    }
  })
})

send<{ path: string, name: string }[]>('/admin/api/routes/list').then(data => {
  routes.data = data
  console.log(data)

  mainNav(routes).render('#main-nav')
  let main = document.querySelector('[data-app]')
  if (main) {
    let dataMain = main.getAttribute('data-app')
    if (dataMain) {
      requirejs([`admin/components/${dataMain}`], function (component: any) {
        if (component && component.load) {
          component.load()
        }
      })
    }
  }
})