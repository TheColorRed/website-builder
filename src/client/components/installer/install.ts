namespace builder {
  document.addEventListener('DOMContentLoaded', e => {
    let btn = document.querySelector('#install') as HTMLInputElement
    btn.addEventListener('click', e => {
      submit(btn.closest('form') as HTMLFormElement)
    })
  })
}