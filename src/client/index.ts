namespace builder {

  export declare type formMethod = 'get' | 'post'

  export function toKeyValue(inputs: NodeListOf<HTMLInputElement>) {
    return Array.from(inputs).reduce<{ [key: string]: string }>((obj, itm) => {
      obj[itm.name] = itm.value || ''
      return obj
    }, {})
  }

  export async function send<T>(url: string): Promise<T>
  export async function send<T>(form: HTMLFormElement): Promise<T>
  export async function send<T>(form: HTMLFormElement, data: { [key: string]: any } | FormData): Promise<T>
  export async function send<T>(url: string, data: { [key: string]: any } | FormData): Promise<T>
  export async function send<T>(url: string, data: { [key: string]: any } | FormData, method: formMethod): Promise<T>
  export async function send<T>(...args: any[]): Promise<T> {
    let url = ''
    let data = {}
    let method: formMethod = args.length == 1 && args[0] instanceof HTMLElement ? args[0].method :
      args.length == 2 && args[0] instanceof HTMLFormElement ? args[0].method :
        args.length == 2 && typeof args[0] == 'string' ? 'get' :
          args.length == 3 ? args[2] : 'get'
    let options: RequestInit = { method }
    options.headers = { 'X-Requested-With': 'XMLHttpRequest' }
    if (args.length == 1 && args[0] instanceof HTMLFormElement) {
      url = args[0].action
      data = new FormData(args[0])
    } else if (args.length == 1 && typeof args[0] == 'string') {
      url = args[0]
      method = 'get'
    } else if (args.length == 2 || args.length == 3) {
      url = args[0] instanceof HTMLFormElement ? args[0].action : args[0]
      data = args[1]
    }

    if (method == 'get') {
      if (data instanceof FormData) {
        let str = Array.from(data.entries()).map(([k, v]) =>
          encodeURIComponent(k) + '=' + encodeURIComponent(v.toString())).join('&')
        if (str.length > 0) url += '?' + str
      } else if (data instanceof Object) {
        let str: string[] = []
        for (let k in data) {
          let v = (<any>data)[k]
          v && str.push(encodeURIComponent(k) + '=' + encodeURIComponent(v.toString()))
        }
        if (str.length > 0) url += '?' + str.join('&')
      }
    } else {
      if (data instanceof FormData) {
        options.body = data
      } else {
        try {
          options.body = JSON.stringify(data)
        } catch (e) {
          options.body = ''
        }
      }
    }

    let csrf = ''
    let csrfMeta = document.querySelector('meta[name=csrf]') as HTMLMetaElement
    if (csrfMeta) csrf = csrfMeta.content
    if (csrf.length > 0) options.headers['X-CSRF-Token'] = csrf
    try {

      let response = await fetch(url, options)
      let text = await response.text()

      try {
        return JSON.parse(text) as T
      } catch (e) {
        return <any>text as T
      }
    } catch (e) {
      console.error(e.message)
    }
    return {} as T
  }

  export async function submit(form: HTMLFormElement | string) {
    let el = (typeof form == 'string' ? document.querySelector(form) : form) as HTMLFormElement
    if (!el.reportValidity()) return
    return await send(el)
    // let response = await fetch(el.action, {
    //   method: el.method,
    //   body: JSON.stringify(obj),
    //   headers: { 'X-Requested-With': 'XMLHttpRequest' }
    // })
    // let text = await response.text()
    // try {
    //   return JSON.parse(text)
    // } catch (e) {
    //   return text
    // }
  }

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
}