namespace builder {
  declare const TRASH_URL: string
  declare const TRASH_RESTORE_URL: string
  Array.from(document.querySelectorAll<HTMLElement>('.trash-delete, .trash-restore')).forEach(el => {
    let dataEl = el.closest('[data-id]') as HTMLElement
    let spinner: HTMLElement
    if (dataEl) spinner = dataEl.querySelector('.spinner') as HTMLElement
    el.addEventListener('click', async function (e) {
      e.preventDefault()
      if (dataEl) {
        if (spinner) spinner.classList.remove('hidden')
        this.classList.add('hidden')
        let id = dataEl.getAttribute('data-id')
        if (id && id.length > 0) {
          let url = this.classList.contains('trash-delete') ? TRASH_URL : TRASH_RESTORE_URL
          await send(url, { id }, 'post')
          dataEl.remove()
        }
      }
    })
  })
}