import { send } from '../ajax';

Array.from(document.querySelectorAll<HTMLFormElement>('.upload-drag-drop')).forEach(form => {
  form.addEventListeners('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
    e.preventDefault()
    e.stopPropagation()
  })
  form.addEventListeners('dragover dragenter', function () { this.classList.add('is-dragover') })
  form.addEventListeners('dragleave dragend drop', function () { this.classList.remove('is-dragover') })
  form.addEventListeners('drop', function (e) {
    let droppedFiles = Array.from((<DragEvent>e).dataTransfer.files)
    droppedFiles.forEach(file => {
      let reader = new FileReader()
      reader.addEventListener('load', async function (e) {
        let type = ''
        if (typeof this.result == 'string') {
          type = ((this.result.match(/^data:(.+);/) || ['', ''])[1].split('/') || ['', ''])[0].trim()
          if (type == 'image') {
            let img = new Image()
            img.src = this.result
            let preview = document.querySelector('.upload-preview .preview') as HTMLElement
            preview.innerHTML = ''
            if (preview) preview.appendChild(img)
            // let uploadRow = document.querySelector('.upload-row') as HTMLElement
            // if (uploadRow) uploadRow.classList.remove('hidden')
            let data = new FormData()
            data.set('path', (<HTMLInputElement>document.querySelector('input[name=path]')).value)
            data.set('file', file, file.name)
            await send(form, data)
          }
        }
      })
      reader.readAsDataURL(file)
    })
  })
  form.addEventListener('progress', (e) => console.log(e.loaded, e.total))
  let input = form.querySelector('input[type=file]') as HTMLInputElement
  if (input) {
    let preview = document.querySelector('.upload-preview .preview') as HTMLElement
    let previewInfo: HTMLElement[] = Array.from(document.querySelectorAll('.upload-preview .preview-info'))
    input.addEventListener('change', function (e) {
      if (input.files instanceof FileList) {
        Array.from(input.files).forEach(async file => {
          let reader = new FileReader()
          reader.addEventListener('loadend', async function (e) {
            let blob = new Blob([<ArrayBuffer>this.result])
            let obj = new Image()
            obj.src = window.URL.createObjectURL(blob)
            if (preview) {
              previewInfo.forEach(el => el.classList.add('hidden'))
              preview.classList.remove('hidden')
              preview.appendChild(obj)
            }
          })
          reader.readAsArrayBuffer(file)
          let data = new FormData()
          data.set('path', (<HTMLInputElement>document.querySelector('input[name=path]')).value)
          data.set(input.name, file, file.name)
          await send(form, data)
        })
      }
      // reader.readAsArrayBuffer(input.files[0])
    })
  }
  // let span = group.querySelector(':scope > span') as HTMLSpanElement
  // let input = group.querySelector(':scope > input[type=file]') as HTMLInputElement
  // if (span && input) {
  //   span.textContent = input.value || 'No File Selected'
  //   input.addEventListener('change', function (e) {
  //     span.textContent = this.value.split(/\\|\//).pop() || ''
  //     let reader = new FileReader()
  //     reader.addEventListener('load', function (e) {
  //       let type = ''
  //       if (typeof this.result == 'string') {
  //         type = ((this.result.match(/^data:(.+);/) || ['', ''])[1].split('/') || ['', ''])[0].trim()
  //         if (type == 'image') {
  //           let img = new Image()
  //           img.src = this.result
  //           let preview = document.querySelector('.upload-preview') as HTMLElement
  //           preview.innerHTML = ''
  //           if (preview) preview.appendChild(img)
  //           let uploadRow = document.querySelector('.upload-row') as HTMLElement
  //           if (uploadRow) uploadRow.classList.remove('hidden')
  //         }
  //       }
  //     })
  //     reader.readAsDataURL((input.files || [])[0])
  //   })
  // }
})
