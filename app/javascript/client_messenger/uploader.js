import {DirectUpload} from 'activestorage'


export function imageUpload(
  file,
  props = false,
  field = false,
  previewField = false
) {
  return new Promise((resolve, reject)=> {
    
    if(props){
      props.onLoading()
      //props.change(previewField, '/spinner.gif')
    }

    const upload = new DirectUpload(
      file,
      '/api/v1/direct_uploads'
    )
    upload.create((error, blob)=>{
      if(error){
        alert("error uploading!")
        props.onError(error)
      } else {
        if(props){
          props.onSuccess(
            {link: blob.service_url}
          )
        }
        resolve({data: {...blob, link: blob.service_url}})
      }
    })
  })
}