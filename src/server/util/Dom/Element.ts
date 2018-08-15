interface QueryObject {
  classList: string[]
  text: string
  id: string
  element: string
  properties: string[]
  attributes: { key: string, value: string }[]
}

export interface EventMap extends ElementEventMap {
  'created': Event
}

export type EventsTypes = {
  [key in keyof (HTMLElementEventMap & EventMap)]?: () => void
}

export interface ElementEvents {
  children?: EventsTypes
}

export interface Element {
  /**
   * This is the element that will be created.
   *
   * * It is defined using a shorthand selector such as ".red#white[data-color=blue]".
   * * Using child selectors are invalid such as ".red > .white" and ".red .white".
   * * Anything after the first space will be converted to text content.
   *
   * @type {string}
   */
  tag: string
  /**
   * This is the text content of the element and overrides the selector text content.
   *
   * @type {string}
   */
  txt?: string
  /**
   * This is the children of the current element.
   *
   * * An array of either elements or string selectors will create multiple elements within the current element.
   * * A single element will will create one element within the current element.
   * * A string will create a single element within the current element.
   *
   * @type {((Element | string)[] | Element | string)}
   */
  children?: (Element | string)[] | Element | string
}

export interface RootElement extends Element {
  parent?: string | HTMLElement | Element
}

export const element = {
  stringify: function (el: RootElement, data?: any) {
    return Element.stringify(el, data)
  },
  parse: function (html: string) {
    return Element.parse(html)
  }
}

export class Element {

  public static parse(html: string): Element {
    let el = new Element

    return el
  }

  public static stringify(el: RootElement, data?: any): string {
    return this.makeElement(el, data)
  }

  private static makeElement(elem: Element | string, data?: any): string {
    let info = this.parseQuerySelector(typeof elem == 'string' ? elem : elem.tag || '')
    let str = `<${info.element}`
    str += `${info.id.length > 0 ? ` id="${info.id}"` : ''}`
    str += `${info.classList.length > 0 ? ` class="${info.classList.join(' ')}"` : ''}`
    info.attributes.forEach(attr => str += ` ${attr.key}="${attr.value}"`)
    info.properties.forEach(prop => str += ` ${prop}`)
    str += '>'
    if (typeof elem == 'object' && elem.children) {
      if (Array.isArray(elem.children)) {
        for (let child of elem.children) {
          str += this.makeElement(child, data)
        }
      } else if (typeof elem.children == 'object' || typeof elem.children == 'string') {
        str += this.makeElement(elem.children, data)
      }
    }
    let text = typeof elem == 'object' && elem.txt ? elem.txt : info.text
    str += this.replacePlaceholders(text || '', data)
    str += `</${info.element}>`
    return str
  }

  private static replacePlaceholders(string: string, data: any) {
    let matches = string.split(/{{(.+?)}}/g).filter(String)
    matches.forEach(match => {
      let path = match.split('.')
      let val = path.reduce((obj, itm) => obj[itm], data)
      string = string.replace(new RegExp('{{' + match + '}}', 'g'), val)
    })
    return string
  }

  private static parseQuerySelector(selector: string) {
    let obj: QueryObject = {
      classList: [],
      id: '',
      element: 'div',
      attributes: [],
      properties: [],
      text: ''
    }
    obj.id = (selector.match(/#[a-z-_0-9]+/) || [''])[0].replace('#', '')
    obj.classList = (selector.match(/\.[a-z-_0-9]+/g) || []).map(v => v.replace('.', ''))
    obj.element = selector.toLowerCase().split(/[^a-z0-9]/, 2)[0] || 'div'
    obj.attributes = (selector.match(/\[.+?\]/g) || []).reduce<{ key: string, value: string }[]>((r, v) => {
      let [key, value] = v.split('=')
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
    obj.properties = (selector.match(/:\D+/g) || []).reduce<string[]>((r, v) => r.concat(v.replace(/^:/, '')), [])
    obj.text = selector.includes(' ') ? selector.substr(selector.indexOf(' ') + 1) : ''
    return obj
  }
}