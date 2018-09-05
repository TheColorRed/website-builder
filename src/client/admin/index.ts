let main = document.querySelector('[data-main]')
if (main) {
  let dataMain = main.getAttribute('data-main')
  if (dataMain) {
    requirejs([`components/${dataMain}`])
  }
}

interface HTMLElement extends Element {
  addEventListeners(type: string, listener: (this: HTMLElement, ev: Event) => void, options?: boolean | AddEventListenerOptions): void
}
HTMLElement.prototype.addEventListeners = function (...args: any[]) {
  (<string>args[0]).split(' ').filter(i => i.trim().length > 0).forEach(event => {
    this.addEventListener(event, args[1], args[2])
  })
}

requirejs(['ajax'], function (ajax: any) {
  Array.from(document.querySelectorAll<HTMLFormElement>('form.ajax')).forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault()
      let data = await ajax.submit(this)
      if (this.hasAttribute('callback')) {
        let callback = this.getAttribute('callback') as string
        (<any>builder)[callback](data)
      }
    })
  })
  ajax.send('/admin/api/routes/list').then((data: { path: string, name: string }[]) => {
    let r = {
      data,
      get(key: string, defaultValue: any = '') {
        let item = this.data.find(d => d.name == key)
        return item && item.path || defaultValue
      },
      is(key: string) {
        let path = window.location.pathname
        return !!this.data.find(i => i.name == key && i.path == path)
      },
      when(key: string, truthy: any = '', falsy: any = '') {
        let path = window.location.pathname
        return !!this.data.find(i => i.name == key && i.path == path) ? truthy : falsy
      }
    }
    requirejs(['templates/admin/nav'], function (nav: any) {
      nav.mainNav(r).render('#main-nav')
    })
  })
})