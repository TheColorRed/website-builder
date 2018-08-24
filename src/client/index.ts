namespace builder {

  declare type formMethod = 'get' | 'post'

  export function toKeyValue(inputs: NodeListOf<HTMLInputElement>) {
    return Array.from(inputs).reduce<{ [key: string]: string }>((obj, itm) => {
      obj[itm.name] = itm.value || ''
      return obj
    }, {})
  }

  export async function send(url: string, data: { [key: string]: any } = {}, method: formMethod = 'get') {
    let options: RequestInit = { method }
    if (method == 'post' && Object.keys(data).length > 0) options.body = JSON.stringify(data)
    else if (method == 'get' && Object.keys(data).length > 0) {
      url += '?' + (Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))).join('&')
    }
    let csrf = ''
    let csrfMeta = document.querySelector('meta[name=csrf]') as HTMLMetaElement
    if (csrfMeta) csrf = csrfMeta.content
    options.headers = { 'X-Requested-With': 'XMLHttpRequest' }
    if (csrf.length > 0) options.headers['X-CSRF-Token'] = csrf
    let response = await fetch(url, options)
    let text = await response.text()
    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  }

  export async function submit(form: HTMLFormElement | string) {
    let el = (typeof form == 'string' ? document.querySelector(form) : form) as HTMLFormElement
    if (!el.reportValidity()) return
    let data = new FormData(el)
    let obj: { [key: string]: string | File } = {}
    Array.from(data.entries()).forEach(i => {
      let [key, value] = i
      obj[key] = typeof value == 'string' ? value.trim() : value
    })
    return await send(el.action, obj, el.method as formMethod)
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

  document.addEventListener('DOMContentLoaded', () => {
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
  })
}