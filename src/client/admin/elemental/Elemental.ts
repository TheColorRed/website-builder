import { Element, RootElementalElement } from './Element';

declare type formMethod = 'get' | 'post'

export function tag(el: RootElementalElement | RootElementalElement[] | Element | string | HTMLElement | DocumentFragment, location?: string | HTMLElement) {
  let elem: Element
  if (el instanceof Element) elem = el
  else elem = new Element(el)
  // let parent = (<RootElementalElement>el).parent
  // if (!ElementalCore.Elemental.DOM_LOADED) {
  //   ElementalCore.Elemental.ELEMENTS.push({ el: elem, loc: parent || location })
  // }
  return elem
}

export function $(element: HTMLElement | DocumentFragment): Tag
export function $(elements: HTMLElement[]): Tag
export function $(selector: string): Tag
export function $(arg: any) {
  return new Tag(arg)
}

class Tag {
  private items: HTMLElement[] = []

  public constructor(element: HTMLElement | DocumentFragment)
  public constructor(elements: HTMLElement[])
  public constructor(selector: string)
  public constructor(arg: any) {
    if (arg instanceof HTMLElement) this.items.push(arg)
    else if (Array.isArray(arg)) this.items = arg
    else if (typeof arg === 'string') this.items = Array.from(document.querySelectorAll<HTMLElement>(arg))
  }

  public dispatch(events: string) {
    this.items.forEach(item => events.split(' ').forEach(evt => item.dispatchEvent(new Event(evt))))
  }

  public broadcast(events: string) {
    let to: HTMLElement[] = []
    // Add the current item list
    to.push(...this.items)
    // Add the item's children
    this.items.forEach(itm => to.push(...Array.from(itm.querySelectorAll<HTMLElement>('*'))))
    // Remove duplicates
    to = [...new Set(to)]
    // Send the message
    to.forEach(item => events.split(' ').forEach(evt => item.dispatchEvent(new Event(evt))))
  }

  public count() {
    return this.items.length
  }

  public find(selector: string) {
    let items: HTMLElement[] = []
    this.items.forEach(item => items.push(...Array.from(item.querySelectorAll<HTMLElement>(selector))))
    this.items = items
    return this
  }

  public closest(selector: string) {
    let items: HTMLElement[] = []
    let closest: HTMLElement
    this.items.forEach(item => (closest = item.closest(selector) as HTMLElement) && items.push(closest))
    this.items = items
    return this
  }

  public remove() {
    this.items.forEach(item => item.remove())
    this.items = []
    return this
  }

  public toggleClass(classes: string, force?: boolean) {
    let classList: string[] = []
    classList.push(...classes.split(' '))
    this.items.forEach(i => classList.forEach(c => i.classList.toggle(c, force)))
    return this
  }

  public addClass(...classes: string[]) {
    let classList: string[] = []
    classes.forEach(c => classList.push(...c.split(' ')))
    this.items.forEach(i => i.classList.add(...classList))
    return this
  }

  public removeClass(...classes: string[]) {
    let classList: string[] = []
    classes.forEach(c => classList.push(...c.split(' ')))
    this.items.forEach(i => i.classList.remove(...classList))
    return this
  }

  public static join(...elements: Element[]) {
    return Element.join(...elements)
  }

  public static forEach<T>(data: T[], callback: (item: T, index: number, data: T[]) => Element) {
    if (Array.isArray(data)) return Element.each<T>(data, callback)
    return new Element('')
  }

  public static create(el: RootElementalElement | Element | string | HTMLElement | DocumentFragment, location?: string | HTMLElement) {
    return tag(el, location)
  }

  public async ajax(url: string, template: (data: any) => Element): Promise<void>
  public async ajax(form: HTMLFormElement, template: (data: any) => Element): Promise<void>
  public async ajax(form: HTMLFormElement, data: { [key: string]: any } | FormData, template: (data: any) => Element): Promise<void>
  public async ajax(url: string, data: { [key: string]: any } | FormData, template: (data: any) => Element): Promise<void>
  public async ajax(url: string, data: { [key: string]: any } | FormData, method: formMethod, template: (data: any) => Element): Promise<void>
  public async ajax(...args: any[]): Promise<void> {
    let url = ''
    let data = {}
    let method = 'get'
    // let method: formMethod = args.length == 1 && args[0] instanceof HTMLElement ? args[0].method :
    //   args.length == 2 && args[0] instanceof HTMLFormElement ? args[0].method :
    //     args.length == 2 && typeof args[0] == 'string' ? 'get' :
    //       args.length == 3 ? args[2] : 'get'

    method = args.length == 4 ? args[2] : method


    let template: ((data: any) => Element) | null = args[args.length - 1]

    if (args.length == 2 && args[0] instanceof HTMLFormElement) {
      url = args[0].action
      data = new FormData(args[0])
    } else if (args.length == 2 && typeof args[0] == 'string') {
      url = args[0]
    } else if (args.length == 3 || args.length == 4) {
      url = args[0] instanceof HTMLFormElement ? args[0].action : args[0]
      data = args[1]
    }

    let options: RequestInit = { method }
    options.headers = { 'X-Requested-With': 'XMLHttpRequest' }

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
    let dta = {}
    try {

      let response = await fetch(url, options)
      let text = await response.text()


      try {
        dta = JSON.parse(text)
      } catch (e) {
        dta = text
      }
    } catch (e) {
      console.error(e.message)
    }

    this.items.forEach(itm => template !== null && template(dta).render(itm))
  }

}

// namespace ElementalCore {

//   export class Elemental {
//     public static DOM_LOADED: boolean = false
//     public static ELEMENTS: { el: Element, loc?: string | HTMLElement | Element }[] = []
//   }

//   document.addEventListener('DOMContentLoaded', () => {
//     Elemental.DOM_LOADED = true
//     Elemental.ELEMENTS.forEach(el => el.el.render(el.loc))
//   })
// }