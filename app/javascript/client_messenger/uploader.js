import { DirectUpload } from '@rails/activestorage/src/direct_upload'

export function imageUpload (
  file,
  props = false,
  field = false,
  previewField = false
) {
  return new Promise((resolve, reject) => {
    if (props) {
      props.onLoading()
      // props.change(previewField, '/spinner.gif')
    }

    const upload = new DirectUpload(
      file,
      `${props.domain}/api/v1/direct_uploads`
    )
    upload.create((error, blob) => {
      if (error) {
        alert('error uploading!')
        props.onError(error)
      } else {
        if (props) {
          props.onSuccess(
            {
              link: blob.service_url,
              filename: blob.filename,
              content_type: blob.content_type
            }
          )
        }
        resolve({ data: { ...blob, link: blob.service_url } })
      }
    })
  })
}
