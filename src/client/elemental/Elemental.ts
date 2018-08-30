function tag(el: Tagger.RootElementalElement | Tagger.Element | string | HTMLElement | DocumentFragment, location?: string | HTMLElement) {
  let elem: Tagger.Element
  if (el instanceof Tagger.Element) elem = el
  else elem = new Tagger.Element(el)
  // let parent = (<Tagger.RootElementalElement>el).parent
  // if (!ElementalCore.Elemental.DOM_LOADED) {
  //   ElementalCore.Elemental.ELEMENTS.push({ el: elem, loc: parent || location })
  // }
  return elem
}

function $(element: HTMLElement): Tag
function $(elements: HTMLElement[]): Tag
function $(selector: string): Tag
function $(arg: any) {
  return new Tag(arg)
}

class Tag {
  private items: HTMLElement[] = []

  public constructor(element: HTMLElement)
  public constructor(elements: HTMLElement[])
  public constructor(selector: string)
  public constructor(arg: any) {
    if (arg instanceof HTMLElement) this.items.push(arg)
    else if (Array.isArray(arg)) this.items = arg
    else if (typeof arg === 'string') this.items = Array.from(document.querySelectorAll<HTMLElement>(arg))
  }

  public dispatch(event: string) {
    this.items.forEach(item => item.dispatchEvent(new Event(event)))
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

  public static join(...elements: Tagger.Element[]) {
    return Tagger.Element.join(...elements)
  }

  public static each<T>(data: T[], callback: (item: T, index: number, data: T[]) => Tagger.Element) {
    return Tagger.Element.each<T>(data, callback)
  }

  public static create(el: Tagger.RootElementalElement | Tagger.Element | string | HTMLElement | DocumentFragment, location?: string | HTMLElement) {
    return tag(el, location)
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