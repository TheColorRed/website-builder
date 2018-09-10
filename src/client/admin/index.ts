declare const globalQuery: import('../util/queryBuilder').QueryBuilder

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

HTMLElement.prototype.addEventListeners = function (types: string, listener: (this: HTMLElement, ev: Event) => void, options?: boolean | AddEventListenerOptions) {
  types.split(' ').filter(String).forEach(event => this.addEventListener(event, listener, options))
}

requirejs(['util/queryBuilder'], function (module: typeof import('../util/queryBuilder')) {
  (function (history) {
    let pushState = history.pushState
    history.pushState = function () {
      pushState.apply(history, arguments)
      module.globalQuery.update()
      window.dispatchEvent(new Event('pushstate'))
    }
  })(window.history)
  requirejs(['admin/init'])
})