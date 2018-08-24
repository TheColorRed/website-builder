namespace builder {
  declare const FILTER_URL: string
  let elements = Array.from(document.querySelectorAll<HTMLElement>('.media-filter'))
  let timeout = -1
  elements.forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault()
      clearTimeout(timeout)
      this.classList.toggle('active')
      let filter = elements.map(el => el.classList.contains('active') ? el.getAttribute('data-type') : '').filter(String)
      timeout = setTimeout(() => { send(FILTER_URL, { filter }, 'post') }, 1000) as any
    })
  })
}