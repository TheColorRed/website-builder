import { tag } from '../../../util/elemental/Elemental';
import { routes } from '../../../util/routes';

export function makeUpload() {
  return tag({
    tag: '.fluid.well',
    children: [
      {
        tag: `form.upload-drag-drop.ajax[action="${routes.get('api-admin-upload-media')}"][method="post"][enctype="multipart/form-data"]`,
        children: {
          tag: '.fluid.row > .col-8.col-2-offset > .row.cell-no-margin',
          children: [
            '.col-2.middle.text-right.gray /media',
            '.col-10: input[type="text"][name="path"][value="/"]'
          ]
        }
      },
      {
        tag: 'label.file-group.row.margin-bottom-15',
        children: [
          'input([ype="file"][name="file"][id="file"]:multiple',
          {
            tag: '.row > .col-12',
            children: {
              tag: '.upload-preview.center.vertical',
              children: [
                'div.preview-info.margin-bottom-20 > i.fas.fa-cloud-upload-alt.fa-10x',
                'div.preview-info[style="font-size:2rem;"] #{strong Choose a file} or drag it here',
                'div.preview.hidden'
              ]
            }
          }
        ]
      }
    ]
  })
}

// .fluid.well
// form.upload-drag-drop.ajax(action=`${route.name('api-admin-upload-media')}` method='post' enctype='multipart/form-data')
//   .fluid.row
//     .col-8.col-2-offset
//       .row.cell-no-margin
//         .col-2.middle.text-right.gray /media
//         .col-10: input(type="text" name="path" value="/")
//   label.file-group.row.margin-bottom-15
//     input(type='file' name='file' id='file' multiple)
//     .row: .col-12: .upload-preview.center.vertical
//       div.preview-info.margin-bottom-20: i.fas.fa-cloud-upload-alt.fa-10x
//       div.preview-info(style="font-size:2rem;") #[strong Choose a file] or drag it here
//       div.preview.hidden