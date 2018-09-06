import { tag, $ } from './Elemental';
import { publicDecrypt } from 'crypto';

// namespace Tagger {

interface QueryObject {
  classList: string[]
  text: string
  id: string
  element: string
  fragment: boolean
  properties: string[]
  attributes: { key: string, value: string }[]
}

export interface ElementalEventMap extends ElementEventMap {
  'created': Event
  'rendered': Event
  'loaded': Event
  'visibility': Event
  '$children': ElementalEventsTypes
  [key: string]: any
}

export type ElementalEventsTypes = {
  [key in keyof (HTMLElementEventMap & ElementalEventMap)]?: (this: HTMLElement, e: Event) => void
}

export interface ElementalChildrenEvents {
  $children?: ElementalEventsTypes
  $selector?: {
    [key in keyof (HTMLElementEventMap & ElementalEventMap)]?: {
      selector: string
      event: (this: HTMLElement, e: Event) => void
    }
  }
}

export interface ElementalElement {
  /**
   * This is the element that will be created.
   *
   * * It is defined using a shorthand selector such as ".red#white[data-color=blue]".
   * * Using child selectors are invalid such as ".red > .white" and ".red .white".
   * * Anything after the first space will be converted to text content.
   *
   * @type {string | Element}
   * @memberof ElementalElement
   */
  tag?: string | Element
  /**
   * This is the text content of the element and overrides the selector text content.
   *
   * @type {string}
   * @memberof ElementalElement
   */
  txt?: string
  /**
   * This is the children of the current element.
   *
   * * An array of either elements or string selectors will create multiple elements within the current element.
   * * A single element will will create one element within the current element.
   * * A string will create a single element within the current element.
   *
   * @type {((ElementalElement | Element | HTMLElement | DocumentFragment | string)[] | ElementalElement | Element | HTMLElement | DocumentFragment | string)}
   * @memberof ElementalElement
   */
  children?: (ElementalElement | Element | HTMLElement | DocumentFragment | string)[] | ElementalElement | Element | HTMLElement | DocumentFragment | string
  /**
   * These are the events for the current element.
   *
   * * A list of functions will automatically execute `addEventListener(propName)` on the current element.
   * * The `children` property in this object is reserved for adding all the contained events on the current element's children.
   *
   * @type {ElementalChildrenEvents | ElementalEventsTypes}
   * @memberof ElementalElement
   */
  events?: ElementalChildrenEvents | ElementalEventsTypes
  /**
   * Should this element be rendered?
   *
   * @type {boolean | Function}
   * @memberof ElementalElement
   */
  render?: boolean | Function
}

export interface RootElementalElement extends ElementalElement {
  parent?: string | HTMLElement | Element
}
// Tagger.createElement(
//   "h1",
//   { class: "red white blue" },
//   Tagger.createElement("span", null, "Hello world"),
//   Tagger.createElement("span", null, "Hello again")
// );
export function createElement(element: string, attributes: { [key: string]: any } | null, ...children: (string | Element)[]) {
  let attrs = []
  if (attributes) {
    for (let attr in attributes) {
      attrs.push(`[${attr}="${attributes[attr]}"]`)
    }
  }
  let selector = element + attrs.join('') + ' ' + children.map(child => typeof child == 'string' ? child : ' ').join('').trim()
  let childMap = children.map(c => c instanceof Element ? c : null).filter(i => i instanceof Element) as Element[]
  let newChildren = Element.join(...childMap)
  return tag({
    tag: selector,
    children: newChildren
  })
}

export class Element {

  private _rootElement!: HTMLElement | DocumentFragment
  private _renderedTo: HTMLElement | undefined
  public get rootElement() { return this._rootElement }

  public constructor(private el: RootElementalElement | (RootElementalElement | string)[] | string | HTMLElement | DocumentFragment) { }

  /**
   * Broadcasts to the tag once rendered
   *
   * @param {string} events The events to broadcast (separated by a space)
   * @memberof Element
   */
  public broadcast(events: string) {
    if (this._renderedTo instanceof HTMLElement) {
      $(this._renderedTo).broadcast(events)
    }
  }

  /**
   * Dispatch to the current element once rendered
   *
   * @param {string} events The events to dispatch (separated by a space)
   * @memberof Element
   */
  public dispatch(events: string) {
    if (this._renderedTo instanceof HTMLElement) {
      $(this._renderedTo).dispatch(events)
    }
  }

  public render(location?: string | HTMLElement | Element) {
    let loc = this.setRoot(location)
    if (!loc) return this
    loc.innerHTML = ''
    loc.appendChild(this.rootElement)
    this._renderedTo = loc
    Array.from(loc.querySelectorAll<HTMLElement>('*')).forEach(el => el.dispatchEvent(new Event('loaded')))
    return this
  }

  public append(location?: string | HTMLElement | Element) {
    let loc = this.setRoot(location)
    if (!loc) return this.el
    loc.appendChild(this.rootElement)
    this._renderedTo = loc
    Array.from(loc.querySelectorAll<HTMLElement>('*')).forEach(el => el.dispatchEvent(new Event('loaded')))
    return this
  }

  private setRoot(location?: string | HTMLElement | Element) {
    let loc = document.body
    // Set the location to render to
    if (location && typeof location == 'string') loc = document.querySelector(location) as HTMLElement
    else if (location instanceof Element) loc = location.rootElement as HTMLElement
    else if (location && location instanceof HTMLElement) loc = location as HTMLElement

    // Build the element
    if (this.el instanceof HTMLElement || this.el instanceof DocumentFragment) this._rootElement = this.el
    else this._rootElement = this.makeElement(this.el, loc)
    return loc
  }

  public compile() {
    if (this.el instanceof HTMLElement || this.el instanceof DocumentFragment) return this.el
    let frag = document.createDocumentFragment()
    this._rootElement = this.makeElement(this.el, frag)
    return this._rootElement
  }

  public toString() {
    // if (element instanceof HTMLElement) return element.outerHTML
    if (this.rootElement instanceof HTMLElement) return this.rootElement.innerHTML
    else if (this.rootElement instanceof DocumentFragment) {
      let div = document.createElement('div')
      for (let e of this.rootElement.children) { div.appendChild(e) }
      return div.innerHTML
    }
    else return ''
  }

  public static each<T>(data: T[], callback: (item: T, index: number, data: T[]) => Element) {
    let frag = document.createDocumentFragment()
    for (let i = 0; i < data.length; i++) {
      let elem = callback(data[i], i, data)
      if (elem.el instanceof HTMLElement || elem.el instanceof DocumentFragment) {
        frag.appendChild(elem.el)
        continue
      }
      frag.appendChild(elem.makeElement(elem.el, frag))
    }
    return new Element(frag)
  }

  public static join(...elements: Element[]) {
    let frag = document.createDocumentFragment()
    for (let elem of elements) {
      if (elem.el instanceof HTMLElement || elem.el instanceof DocumentFragment) {
        frag.appendChild(elem.el)
        continue
      }
      frag.appendChild(elem.makeElement(elem.el, frag))
    }
    return new Element(frag)
  }

  private makeElement<T extends HTMLElement | DocumentFragment>(elem: ElementalElement | (ElementalElement | string)[] | Element | HTMLElement | DocumentFragment | string, parent: HTMLElement | DocumentFragment): T {
    if (elem instanceof HTMLElement || elem instanceof DocumentFragment) {
      parent.appendChild(elem)
      return elem as T
    } else if (elem instanceof Element) {
      let e = this.makeElement(elem.el, parent)
      parent.appendChild(e)
      if (elem.el instanceof HTMLElement || elem.el instanceof DocumentFragment) {
        return elem.el as T
      }
      return e as T
    } else if (Array.isArray(elem)) {
      let frag = document.createDocumentFragment()
      elem.forEach(e => this.makeElement(e, frag))
      return frag as T
    } else if (typeof elem != 'string') {
      let r = true
      if (typeof elem.render == 'function') r = elem.render()
      else if (typeof elem.render == 'boolean') r = elem.render
      // typeof elem.tag == 'string' && elem.tag.includes('.up-level') && console.log(r, elem)
      if (r === false) return document.createDocumentFragment() as T
    }

    let tag = typeof elem == 'string' ? elem :
      elem.tag ? elem.tag : '$frag'

    // If the tag is an element make the element
    if (tag instanceof Element) return this.makeElement(tag, parent)

    if (typeof tag == 'string') {
      let t = tag.replace(/\s*\>(?![^[]*])\s*/g, '>')
      if (t.includes('>')) {
        let root = parent
        t.split(/\s*\>(?![^[]*])\s*/).forEach(itm => {
          parent = this.makeElement(itm, parent)
          tag = itm
          typeof elem != 'string' && elem.tag && (elem.tag = itm)
        })
        if (typeof elem != 'string' && elem.children) {
          Array.isArray(elem.children) && elem.children.forEach(child => {
            this.makeElement(child, parent)
          })
          if (elem && typeof elem.children == 'object') {
            this.makeElement(<ElementalElement>elem.children, parent)
          }
        }
        typeof elem != 'string' && parent instanceof HTMLElement && this.addEvents(elem, parent)
        typeof elem != 'string' && parent instanceof HTMLElement && this.addChildEvents(elem, parent)
        typeof elem != 'string' && parent instanceof HTMLElement && this.addSelectorEvents(elem, parent)
        return root.firstChild as T
      }
    }

    let info = this.parseQuerySelector(tag)
    let el = info.fragment ? document.createDocumentFragment() : document.createElement(info.element)
    // Add the classes, attributes and the id to the element
    if (el instanceof HTMLElement) {
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ?
        el instanceof HTMLElement && el.setAttribute(a.key, a.value) :
        el instanceof HTMLElement && el.setAttribute(a.value, a.value))
      info.properties.forEach(p => el instanceof HTMLElement && el.setAttribute(p, p))
      // console.log(el)
    }
    parent && parent.appendChild(el)

    // If the element is a string create the element
    if (typeof elem == 'string') {
      info.text.length > 0 && this.makeText(info.text, el)
      // if (el instanceof HTMLElement) {
      //   elementalParent ? this.addEvents(elementalParent, el) : this.addEvents(el)
      //   elementalParent ? this.addChildEvents(elementalParent, el) : this.addChildEvents(el)
      //   elementalParent ? this.addSelectorEvents(elementalParent, el) : this.addSelectorEvents(el)
      // }
    }
    // If the element isn't a string create from the object
    else {
      let text = elem.txt && elem.txt.length > 0 ? elem.txt : info.text.length > 0 ? info.text : ''
      text.length > 0 && this.makeText(text, el)
      // Adds the events to the current element
      // el instanceof HTMLElement && this.addEvents(elem, el)
      // Create the child elements
      if (elem && Array.isArray(elem.children)) {
        // The children elements are an array of items
        // Loop through them and add them
        elem.children.forEach(child => {
          this.makeElement(child, el)
        })
      } else if (elem && ['object', 'string'].includes(typeof elem.children)) {
        // The children elements is a single element either of an object or string
        this.makeElement(elem.children as ElementalElement, el)
      }
      // Adds the same event to all the child elements
      // el instanceof HTMLElement && this.addChildEvents(elem, el)
      // el instanceof HTMLElement && this.addSelectorEvents(elem, el)
    }
    // let c = typeof elem != 'undefined' && typeof elem != 'string' ? elem :
    //   typeof elementalParent != 'undefined' && typeof elementalParent != 'string' ? elementalParent : null
    if (typeof elem != 'undefined' && typeof elem != 'string') {
      el instanceof HTMLElement && this.addEvents(elem, el)
      el instanceof HTMLElement && this.addChildEvents(elem, el)
      el instanceof HTMLElement && this.addSelectorEvents(elem, el)
    }
    // else {
    //   console.log(elem, elementalParent el)
    // }
    el.dispatchEvent(new Event('rendered'))
    return el as T
    // return (root ? root : el) as T
  }

  private makeText(text: string, el: HTMLElement | DocumentFragment) {
    let orig = text
    text = text.replace(/\#\{(.+?)\}/g, (a: string, b: string) => {
      return (this.makeElement(b, document.createDocumentFragment()) as HTMLElement).outerHTML
    })
    if (el instanceof HTMLElement && orig != text) {
      el.innerHTML = text
    } else {
      el.appendChild(document.createTextNode(text))
    }
  }

  private addEvents(el: HTMLElement): void
  private addEvents(elem: ElementalElement, el: HTMLElement): void
  private addEvents(...args: (ElementalElement | HTMLElement)[]): void {
    let elem = (args.length == 2 ? args[0] : null) as ElementalElement
    let el = (args.length == 1 ? args[0] : args[1]) as HTMLElement
    if (elem && elem.events) {
      for (let evtName in elem.events) {
        let event = (<any>elem.events)[evtName]
        // If the event is not a function go to next item
        if (!['function', 'string'].includes(typeof event)) continue
        if (typeof event == 'function') {
          el.addEventListener(evtName, event.bind(el))
        } else if (typeof event == 'string') {
          let theEvent = event.split('.').reduce((acc, key) => acc && (<any>acc)[key] ? (<any>acc)[key] : null, window)
          if (theEvent) el.addEventListener(evtName, theEvent.bind(el))
        }
        if (evtName == 'visibility') {
          new IntersectionObserver((entries) => {
            for (let entry of entries) {
              entry.target.dispatchEvent(new Event(evtName))
            }
          }).observe(el)
        }
      }
      el.dispatchEvent(new Event('created'))
    }
  }

  private addSelectorEvents(el: HTMLElement): void
  private addSelectorEvents(elem: ElementalElement, el: HTMLElement): void
  private addSelectorEvents(...args: (ElementalElement | HTMLElement)[]): void {
    let elem = (args.length == 2 ? args[0] : null) as ElementalElement
    let el = (args.length == 1 ? args[0] : args[1]) as HTMLElement
    // Add the events to the selector elements
    if (elem && elem.events && elem.events.$selector) {
      for (let evtName in elem.events.$selector) {
        let evt = (<any>elem.events.$selector)[evtName] as { selector: string, event: (e: Event) => void }
        Array.from(el.querySelectorAll<HTMLElement>(evt.selector)).forEach(itm => {
          itm.addEventListener(evtName, evt.event)
        })
      }
    }
  }

  private addChildEvents(el: HTMLElement): void
  private addChildEvents(elem: ElementalElement, el: HTMLElement): void
  private addChildEvents(...args: (ElementalElement | HTMLElement)[]): void {
    let elem = (args.length == 2 ? args[0] : null) as ElementalElement
    let el = (args.length == 1 ? args[0] : args[1]) as HTMLElement
    // Add the events to the child elements
    if (elem && elem.events && elem.events.$children) {
      // console.log(elem, el)
      let children = Array.from(el.children)
      // Add the rest of the events on the children
      for (let evtName in elem.events.$children) {
        let event = (<any>elem.events.$children)[evtName]
        if (!['function', 'string'].includes(typeof event)) continue
        children.forEach(child => {
          if (typeof event == 'function') {
            child.addEventListener(evtName, event.bind(child))
            // el.addEventListener(evtName, event.bind(el))
          } else if (typeof event == 'string') {
            let theEvent = event.split('.').reduce((acc, key) => acc && (<any>acc)[key] ? (<any>acc)[key] : null, window)
            if (theEvent) child.addEventListener(evtName, theEvent.bind(child))
          }
        })
      }
      children.forEach(child => child.dispatchEvent(new Event('rendered')))
    }
  }

  private parseQuerySelector(selectorLogic: string) {
    let obj: QueryObject = {
      classList: [],
      id: '',
      element: 'div',
      fragment: false,
      attributes: [],
      properties: [],
      text: ''
    }
    // Get the selector portion of the logic
    let newLogic = selectorLogic.replace(/\s*\>(?![^[]*])\s*/g, '>')
    let selector = newLogic.replace(/\s+(?![^[]*]).+/, '').trim()
    // Get the text portion of the logic
    obj.text = (selectorLogic.match(/\s+(?![^[]*]).+/) || [''])[0].trim()
    // Get the id
    obj.id = (selector.match(/#[\w-_]+(?![^[]*])/) || [''])[0].replace('#', '')
    // Get the class list
    obj.classList = (selector.match(/\.[\w-_]+(?![^[]*])/g) || []).map(v => v.replace('.', ''))
    // Get the element (defaults to a `div`)
    obj.element = selector.toLowerCase().split(/[^a-z0-9]/, 2)[0] || 'div'
    // Check if the element should be a document fragment
    if (selector.startsWith('$frag') || selector.startsWith('$fragment')) obj.fragment = true
    // Get the attributes
    obj.attributes = (selector.match(/\[.+?\]/g) || []).reduce<{ key: string, value: string }[]>((r, v) => {
      let items = v.split('=')
      let key = items.shift()
      let value = items.join('=')
      key = !key ? '' : key
      value = !value ? '' : value
      return r.concat({
        key: key.replace(/^\[|\]$/g, ''),
        value:
          // Remove the brackets
          value.replace(/\]$/g, '')
            // Remove the first quote or apostrophe at the beginning of the string only
            .replace(/^('|")/, '')
            // Remove the last quote or apostrophe at the end of the string only
            .replace(/('|")$/, '')
      })
    }, [])
    // Get the properties which are values that are prefixed with a ":"
    obj.properties = (selector.match(/:\w+(?![^[]*])/g) || []).reduce<string[]>((r, v) => r.concat(v.replace(/^:/, '')), [])
    return obj
  }
}
// }