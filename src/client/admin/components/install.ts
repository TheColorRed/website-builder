import { send, toKeyValue, submit } from '../ajax';

declare const TEST_CONN: string
declare const REDIRECT_TO: string
function dbFormat(str: string) {
  return str.replace(/[^\w\s]+/g, '').replace(/\s/g, '-').replace(/-$/g, '').toLowerCase()
}
function update(el: HTMLInputElement) {
  let isValid = el.checkValidity()
  el.classList.toggle('required', !isValid)
}

// Handle the install button
let btnInstall = document.querySelector('#install') as HTMLInputElement
btnInstall && btnInstall.addEventListener('click', async e => {
  e.preventDefault()
  let response = await submit(btnInstall.closest('form') as HTMLFormElement) as { error: boolean, message: string }
  if (!response.error) {
    window.location.href = REDIRECT_TO
  } else {
    alert(response.message)
  }
})

// Handle the test connection button
let btnTestConnection = document.querySelector('#test-connection') as HTMLInputElement
btnTestConnection && btnTestConnection.addEventListener('click', async e => {
  let items = document.querySelectorAll('input[name^=db-]') as NodeListOf<HTMLInputElement>
  let response = await send(TEST_CONN, toKeyValue(items), 'post') as { error: boolean, message: string }
  if (response.error) alert(response.message)
  else alert('Connection successful')
})

let title = document.querySelector('[name=website-title]') as HTMLInputElement
let database = document.querySelector('[name=db-database]') as HTMLInputElement
if (title && database) {
  database.value = dbFormat(title.value)
  title.addEventListener('input', function () {
    if (!database.classList.contains('sync')) return
    database.value = dbFormat(title.value)
  })
  database.addEventListener('input', function () {
    database.classList.remove('sync')
  })
}

let resync = document.querySelector('.re-sync') as HTMLAnchorElement
resync && resync.addEventListener('click', e => {
  e.preventDefault()
  database && database.classList.add('sync')
  database && title && (database.value = dbFormat(title.value))
  update(database)
})

if (btnInstall) {
  // Form features
  let form = btnInstall.closest('form') as HTMLFormElement
  // Array.from(form.querySelectorAll<HTMLInputElement>('input[type=text], input[type=password], input[type=email], input[type=number]'))
  form && Array.from(form.querySelectorAll<HTMLInputElement>('text,password,email,number'.replace(/\w+/g, 'input[type=$&]')))
    .forEach(el => {
      update(el)
      el.addEventListener('input', function () {
        if (!this.required) return
        update(el)
      })
    })
}