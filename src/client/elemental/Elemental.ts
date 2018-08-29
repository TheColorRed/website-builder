namespace Elemental {
  export class Elemental {
    public static DOM_LOADED: boolean = false
    public static ELEMENTS: { el: Element, loc?: string | HTMLElement | Element }[] = []
  }

  document.addEventListener('DOMContentLoaded', () => {
    Elemental.DOM_LOADED = true
    Elemental.ELEMENTS.forEach(el => el.el.render(el.loc))
  })
}