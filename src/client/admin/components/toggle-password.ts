namespace builder {
  Array.from(document.querySelectorAll('.toggle-password')).forEach(el => {
    // Get the associated elements
    let toggle = el.querySelector('.toggle') as HTMLElement
    let input = el.querySelector('input[type=password]') as HTMLInputElement

    // Disable link elements
    toggle.addEventListener('click', e => e.preventDefault())

    // Make sure the element is an input element and it's type is "password"
    if (!(input instanceof HTMLInputElement) || input.type != 'password') return

    // Toggle the input element once clicked
    toggle.addEventListener('click', () => {
      input.type = input.type == 'password' ? 'text' : 'password'
      let i = toggle.querySelector('i')
      if (!i) return
      i.classList.toggle('fa-eye-slash', input.type == 'text')
      i.classList.toggle('fa-eye', input.type == 'password')
    })
  })
}