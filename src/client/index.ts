namespace builder {

  export function toKeyValue(inputs: NodeListOf<HTMLInputElement>) {
    return Array.from(inputs).reduce<{ [key: string]: string }>((obj, itm) => {
      obj[itm.name] = itm.value
      return obj
    }, {})
  }

  export async function send(url: string, data: {} = {}, method: 'get' | 'post' = 'get') {
    let options: RequestInit = { method }
    if (Object.keys(data).length > 0) options.body = JSON.stringify(data)
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
    let response = await fetch(el.action, {
      method: el.method,
      body: JSON.stringify(obj)
    })
    let text = await response.text()
    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  }
}