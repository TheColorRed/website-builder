interface RouteList {
  data: {
    path: string
    name: string
  }[]
  get(key: string, defaultValue?: any): any
  is(key: string): boolean
  when(key: string, truthy?: any, falsy?: any): any
}

interface HTMLElement extends Element {
  addEventListeners(type: string, listener: (this: HTMLElement, ev: Event) => void, options?: boolean | AddEventListenerOptions): void
}

HTMLElement.prototype.addEventListeners = function (...args: any[]) {
  (<string>args[0]).split(' ').filter(i => i.trim().length > 0).forEach(event => {
    this.addEventListener(event, args[1], args[2])
  })
}

const routes: RouteList = {
  data: [],
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

let queryBuilder: any

(function (history) {
  let pushState = history.pushState
  history.pushState = function () {
    pushState.apply(history, arguments)
    queryBuilder.update()
    window.dispatchEvent(new Event('pushstate'))
  }
})(window.history)

requirejs(['util/queryBuilder'], function (module: any) {
  queryBuilder = module.QueryBuilder.create()
})

requirejs(['util/ajax'], function (ajax: any) {
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
    routes.data = data
    console.log(data)

    requirejs(['admin/templates/admin/nav'], function (nav: any) {
      nav.mainNav(routes).render('#main-nav')
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
  })
})