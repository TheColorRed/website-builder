namespace Elemental {

  interface QueryObject {
    classList: string[]
    text: string
    id: string
    element: string
    properties: string[]
    attributes: { key: string, value: string }[]
  }

  export interface ElementalEventMap extends ElementEventMap {
    'created': Event
    'rendered': Event
    'loaded': Event
  }

  export type ElementalEventsTypes = {
    [key in keyof (HTMLElementEventMap & ElementalEventMap)]?: () => void
  }

  export interface ElementalEvents {
    children?: ElementalEventsTypes
  }

  export interface ElementalElement {
    /**
     * This is the element that will be created.
     *
     * * It is defined using a shorthand selector such as ".red#white[data-color=blue]".
     * * Using child selectors are invalid such as ".red > .white" and ".red .white".
     * * Anything after the first space will be converted to text content.
     *
     * @type {string}
     * @memberof ElementalElement
     */
    tag: string
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
     * @type {((ElementalElement | Element | DocumentFragment | string)[] | ElementalElement | Element | DocumentFragment | string)}
     * @memberof ElementalElement
     */
    children?: (ElementalElement | Element | DocumentFragment | string)[] | ElementalElement | Element | DocumentFragment | string
    /**
     * These are the events for the current element.
     *
     * * A list of functions will automatically execute `addEventListener(propName)` on the current element.
     * * The `children` property in this object is reserved for adding all the contained events on the current element's children.
     *
     * @type {ElementalEvents}
     * @memberof ElementalElement
     */
    events?: ElementalEvents & ElementalEventsTypes
    /**
     * Should this element be rendered?
     *
     * @type {boolean}
     * @memberof ElementalElement
     */
    render?: boolean
  }

  export interface RootElementalElement extends ElementalElement {
    parent?: string | HTMLElement | Element
  }

  export class Element {

    private _rootElement?: HTMLElement | DocumentFragment
    public get rootElement() { return this._rootElement }

    public constructor(private el: RootElementalElement | string | HTMLElement | DocumentFragment) { }

    public render(location?: string | HTMLElement | Element) {
      let loc = document.body
      if (location && typeof location == 'string') loc = document.querySelector(location) as HTMLElement
      else if (location instanceof Element) loc = location.rootElement as HTMLElement
      else if (location && location instanceof HTMLElement) loc = location as HTMLElement
      if (!loc) return
      if (this.el instanceof HTMLElement || this.el instanceof DocumentFragment) this._rootElement = this.el
      else this._rootElement = this.makeElement(this.el, loc)
    }

    public compile() {
      let frag = document.createDocumentFragment()
      // if (this.el instanceof HTMLElement || this.el instanceof DocumentFragment) return this.el
      let result = this.makeElement(this.el, frag)
      console.log(result.outerHTML)
      Array.from(result.querySelectorAll<HTMLElement>('*')).forEach(el => el.dispatchEvent(new Event('loaded')))
      return result
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
        let el = elem.el
        if (el instanceof HTMLElement || el instanceof DocumentFragment) {
          frag.appendChild(el)
          continue
        }
        frag.appendChild(elem.makeElement(el, frag))
      }
      return new Element(frag)
    }

    private makeElement<T extends HTMLElement | DocumentFragment>(elem: ElementalElement | HTMLElement | DocumentFragment | string, parent: HTMLElement | DocumentFragment): T {
      if (elem instanceof DocumentFragment || elem instanceof HTMLElement) {
        parent.appendChild(elem)
        return elem as T
      }
      let info = this.parseQuerySelector(typeof elem == 'string' ? elem : elem.tag || '')
      let el = document.createElement(info.element)
      // Add the classes, attributes and the id to the element
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
      info.properties.forEach(p => el.setAttribute(p, p))
      parent.appendChild(el)

      // If the element is a string create the element
      if (typeof elem == 'string') {
        info.text.length > 0 && el.appendChild(document.createTextNode(info.text))
      }
      // If the element isn't a string create from the object
      else {
        let text = elem.txt && elem.txt.length > 0 ? elem.txt : info.text.length > 0 ? info.text : ''
        text.length > 0 && el.appendChild(document.createTextNode(text))
        // Adds the events to the current element
        this.addEvents(elem, el)
        // Create the child elements
        if (elem && Array.isArray(elem.children)) {
          // The children elements are an array of items
          // Loop through them and add them
          elem.children.forEach(child => {
            if ((typeof child['render'] == 'boolean' && child['render']) || typeof child['render'] == 'undefined')
              this.makeElement(child, el)
          })
        } else if (elem && ['object', 'string'].includes(typeof elem.children)) {
          // The children elements is a single element either of an object or string
          this.makeElement(elem.children as ElementalElement, el)
        }
        // Adds the same event to all the child elements
        this.addChildEvents(elem, el)
      }
      el.dispatchEvent(new Event('rendered'))
      return el as T
    }

    private addEvents(elem: ElementalElement, el: HTMLElement) {
      if (elem.events) {
        for (let evtName in elem.events) {
          let event = (<any>elem.events)[evtName]
          // If the event is not a function go to next item
          if (typeof event != 'function') continue
          el.addEventListener(evtName, event.bind(el))
        }
        el.dispatchEvent(new Event('created'))
      }
    }

    private addChildEvents(elm: ElementalElement, el: HTMLElement) {
      // Add the events to the child elements
      if (elm.events && elm.events.children) {
        let children = Array.from(el.children)
        // Add the rest of the events on the children
        for (let evtName in elm.events.children) {
          let event = (<any>elm.events.children)[evtName]
          children.forEach(child => child.addEventListener(evtName, event.bind(child)))
        }
        children.forEach(child => child.dispatchEvent(new Event('rendered')))
      }
    }

    private parseQuerySelector(selector: string) {
      let obj: QueryObject = {
        classList: [],
        id: '',
        element: 'div',
        attributes: [],
        properties: [],
        text: ''
      }
      obj.id = (selector.match(/#\w+(?![^[]*])/) || [''])[0].replace('#', '')
      obj.classList = (selector.match(/\.[\w-_]+(?![^[]*])/g) || []).map(v => v.replace('.', ''))
      obj.element = selector.toLowerCase().split(/[^a-z0-9]/, 2)[0] || 'div'
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
      obj.properties = (selector.match(/:\w+(?![^[]*])/g) || []).reduce<string[]>((r, v) => r.concat(v.replace(/^:/, '')), [])
      // obj.properties = (selector.match(/:\D+/g) || []).reduce<string[]>((r, v) => r.concat(v.replace(/^:/, '')), [])
      // obj.text = selector.includes(' ') ? selector.substr(selector.indexOf(' ') + 1) : ''
      obj.text = (selector.match(/\s+(?![^[]*]).+/g) || [''])[0].trim()
      return obj
    }
  }
}