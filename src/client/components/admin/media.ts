namespace builder {
  // declare const FILTER_URL: string
  let elements = Array.from(document.querySelectorAll<HTMLElement>('.media-filter'))
  // let timeout = -1
  let search = document.querySelector('.media-query-filter input') as HTMLInputElement
  search && search.addEventListener('input', e => {
    e.preventDefault()
    applyFilter()
    // clearTimeout(timeout)
    // timeout = setTimeout(() => { applyFilter() }, 300) as any
  })
  elements.forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault()
      // clearTimeout(timeout)
      this.classList.toggle('active')
      applyFilter()
      // timeout = setTimeout(() => { applyFilter() }, 500) as any
    })
  })

  function applyFilter() {
    let types = getTypes()
    let query = getQuery()
    Array.from(document.querySelectorAll<HTMLElement>('.row.media-file')).forEach(row => {
      let type = row.getAttribute('data-type') || ''
      let file = row.getAttribute('data-file') || ''
      if (
        // query and media type filter
        (types.includes(type) && file.includes(query)) ||
        // query only filter
        (file.includes(query) && types.length == 0) ||
        // media type only filter
        (types.includes(type) && query.length == 0)) { row.classList.remove('hidden') }
      else { row.classList.add('hidden') }
    })
  }

  function getQuery() {
    return search ? search.value : ''
  }

  function getTypes() {
    return elements.map(el => el.classList.contains('active') ? el.getAttribute('data-type') : '').filter(String)
  }

  function getPath() {
    return window.location.search.replace(/^\?/, '').split('&').reduce((acc, val) => {
      let [k, v] = val.split('=', 2)
      return k == 'path' ? v : acc
    }, '') || '/media'
  }

}