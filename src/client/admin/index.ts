let main = document.querySelector('[data-main]')
if (main) {
  let dataMain = main.getAttribute('data-main')
  if (dataMain) {
    requirejs([`components/${dataMain}`])
  }
}
requirejs(['ajax'], function (ajax: any) {
  Array.from(document.querySelectorAll<HTMLFormElement>('form.ajax')).forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault()
      let data = await ajax.submit(this)
      if (this.hasAttribute('callback')) {
        let callback = this.getAttribute('callback') as string
        (<any>builder)[callback](data)
      }
    })
  })
})