namespace builder {
  export async function submit(form: HTMLFormElement | string) {
    let el = (typeof form == 'string' ? document.querySelector(form) : form) as HTMLFormElement
    if (!el.reportValidity()) return
    let data = new FormData(el)
    let obj: { [key: string]: string | File } = {}
    Array.from(data.entries()).forEach(i => obj[i[0]] = i[1])
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