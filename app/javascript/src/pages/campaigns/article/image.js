// IMPORTANT: this version has no file state

import React from 'react'
import {
  EditorBlock,
  EditorState } from 'draft-js'
import axios from "axios"
import { updateDataOfBlock, addNewBlockAt } from 'Dante2/package/es/model/index.js'
import {image} from "Dante2/package/es/components/icons.js"

export default class ImageBlock extends React.Component {

  constructor(props) {
    super(props)
    let existing_data = this.props.block.getData().toJS()

    this.config = this.props.blockProps.config
    this.file = this.props.blockProps.data.get('file')
    this.state = {
      loading: false,
      selected: false,
      loading_progress: 0,
      caption: this.defaultPlaceholder(),
      direction: existing_data.direction || "center",
      width: 0,
      height: 0,
      //file: null,
      url: this.blockPropsSrc() || this.defaultUrl(existing_data),
      aspect_ratio: this.defaultAspectRatio(existing_data)
    }
  }

  componentDidMount() {
    return this.replaceImg()
  }

  componentWillUnMount() {
    //debugger
  }

  blockPropsSrc = ()=> {
    return this.props.blockProps.data.src
  }

  defaultUrl = (data)=> {
    if (data.url) {
      return data.url
    }

    if (data.url) {
      if (data.file) {
        return URL.createObjectURL(data.file)
      } else {
        return data.url
      }
    } else {
      return this.props.blockProps.data.src
    }
  }

  defaultPlaceholder = ()=> {
    return this.props.blockProps.config.image_caption_placeholder
  }

  defaultAspectRatio = (data)=> {
    if (data.aspect_ratio) {
      return {
        width: data.aspect_ratio['width'],
        height: data.aspect_ratio['height'],
        ratio: data.aspect_ratio['ratio']
      }
    } else {
      return {
        width: 0,
        height: 0,
        ratio: 100
      }
    }
  }

  getAspectRatio = (w, h)=> {
    let maxWidth = 1000
    let maxHeight = 1000
    let ratio = 0
    let width = w // Current image width
    let height = h // Current image height

    // Check if the current width is larger than the max
    if (width > maxWidth) {
      ratio = maxWidth / width // get ratio for scaling image
      height = height * ratio // Reset height to match scaled image
      width = width * ratio // Reset width to match scaled image

      // Check if current height is larger than max
    } else if (height > maxHeight) {
      ratio = maxHeight / height // get ratio for scaling image
      width = width * ratio // Reset width to match scaled image
      height = height * ratio // Reset height to match scaled image
    }

    let fill_ratio = height / width * 100
    let result = { width, height, ratio: fill_ratio }
    // console.log result
    return result
  }

  // will update block state
  updateData = ()=> {
    let { blockProps, block } = this.props
    let { getEditorState } = blockProps
    let { setEditorState } = blockProps
    let data = block.getData()
    let newData = data.merge(this.state).merge({ forceUpload: false })
    return setEditorState(updateDataOfBlock(getEditorState(), block, newData))
  }

  replaceImg = ()=> {
    this.img = new Image()
    this.img.src = this.refs.image_tag.src
    this.setState({
      url: this.img.src })
    let self = this
    // exit only when not blob and not forceUload
    if (!this.img.src.includes("blob:") && !this.props.block.data.get("forceUpload")) {
      return
    }
    return this.img.onload = () => {
      this.setState({
        width: this.img.width,
        height: this.img.height,
        aspect_ratio: self.getAspectRatio(this.img.width, this.img.height)
      })

      return this.handleUpload()
    }
  }

  startLoader = ()=> {
    return this.setState({
      loading: true })
  }

  stopLoader = ()=> {
    return this.setState({
      loading: false })
  }

  handleUpload = ()=> {
    this.startLoader()
    this.updateData()
    return this.uploadFile()
  }

  aspectRatio = ()=> {
    return {
      maxWidth: `${ this.state.aspect_ratio.width }`,
      maxHeight: `${ this.state.aspect_ratio.height }`,
      ratio: `${ this.state.aspect_ratio.height }`
    }
  }

  updateDataSelection = ()=> {
    const { getEditorState, setEditorState } = this.props.blockProps
    const newselection = getEditorState().getSelection().merge({
      anchorKey: this.props.block.getKey(),
      focusKey: this.props.block.getKey()
    })

    return setEditorState(EditorState.forceSelection(getEditorState(), newselection))
  }

  handleGrafFigureSelectImg = (e)=> {
    e.preventDefault()
    return this.setState({ selected: true }, this.updateDataSelection)
  }

  //main_editor.onChange(main_editor.state.editorState)

  coords = ()=> {
    return {
      maxWidth: `${ this.state.aspect_ratio.width }px`,
      maxHeight: `${ this.state.aspect_ratio.height }px`
    }
  }

  getBase64Image = (img) =>{
    let canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    let ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)
    let dataURL = canvas.toDataURL("image/png")

    return dataURL
  }

  formatData = ()=> {
    let formData = new FormData()
    if (this.file) {
      let formName = this.config.upload_formName || 'file'

      formData.append(formName, this.file)
      return formData
    } else {
      formData.append('url', this.props.blockProps.data.get("url"))
      return formData
    }
  }

  getUploadUrl = ()=> {
    let url = this.config.upload_url
    if (typeof url === "function") {
      return url()
    } else {
      return url
    }
  }

  getUploadHeaders()  {
   return this.config.upload_headers || {}
  }

  uploadFile = ()=> {

    // custom upload handler
    if (this.config.upload_handler) {
      return this.config.upload_handler(this.formatData().get('file'), this)
    }
    
    if (!this.config.upload_url){
      this.stopLoader()
      return
    }
  
    this.props.blockProps.addLock()
    
    axios({
      method: 'post',
      url: this.getUploadUrl(),
      headers: this.getUploadHeaders(),
      data: this.formatData(),
      onUploadProgress: e => {
        return this.updateProgressBar(e)
      }
    }).then(result => {
      this.uploadCompleted(result.data.url)

      if (this.config.upload_callback) {
        return this.config.upload_callback(result, this)
      }
    }).catch(error => {
      this.uploadFailed()

      console.log(`ERROR: got error uploading file ${ error }`)
      if (this.config.upload_error_callback) {
        return this.config.upload_error_callback(error, this)
      }
    })

    return json_response => {
      return this.uploadCompleted(json_response.url)
    }
  }

  uploadFailed = ()=> {
    this.props.blockProps.removeLock()
    this.stopLoader()
  }

  uploadCompleted(url) {
    this.setState({ url }, this.updateData)
    this.props.blockProps.removeLock()
    this.stopLoader()
    this.file = null
  }

  updateProgressBar(e) {
    let complete = this.state.loading_progress
    if (e.lengthComputable) {
      complete = e.loaded / e.total * 100
      complete = complete != null ? complete : { complete: 0 }
      this.setState({
        loading_progress: complete })
      return console.log(`complete: ${ complete }`)
    }
  }

  placeHolderEnabled = ()=> {
    return this.state.enabled || this.props.block.getText()
  }

  placeholderText = ()=> {
    return this.config.image_caption_placeholder || 'caption here (optional)'
  }

  handleFocus(e) {

  }

  imageUrl =()=> {
    if(this.state.url.includes("://")) return this.state.url
    return `${this.config.domain ? this.config.domain : '' }${this.state.url}`
  }

  render = ()=> {

    return (
      <div ref="image_tag2" suppressContentEditableWarning={true}>
        <div className="aspectRatioPlaceholder is-locked"
          style={this.coords()}
          onClick={this.handleGrafFigureSelectImg}>
          <div style={{ paddingBottom: `${ this.state.aspect_ratio.ratio }%` }}
            className='aspect-ratio-fill' />
          <img 
            src={this.imageUrl()}
            ref="image_tag"
            height={this.state.aspect_ratio.height}
            width={this.state.aspect_ratio.width}
            className='graf-image'
            contentEditable={false}
            alt={this.state.url}
          />
          <Loader toggle={this.state.loading}
            progress={this.state.loading_progress} />
        </div>
        <figcaption className='imageCaption' onMouseDown={this.handleFocus}>
          { this.props.block.getText().length === 0 ?
            <span className="danteDefaultPlaceholder">
              {this.placeholderText()}
            </span> : undefined}
          <EditorBlock {...Object.assign({}, this.props, {
            "editable": true, "className": "imageCaption" })
            } />
        </figcaption>
      </div>
    )
  }
}

class Loader extends React.Component {

  render = ()=> {
    return (
      <div>
        { this.props.toggle
          ? <div className="image-upoader-loader">
              <p>
                { this.props.progress === 100
                  ? "processing image..."
                  : <span>
                      <span>loading</span> { Math.round( this.props.progress ) }
                    </span>
                }
              </p>
            </div>
          : undefined
        }
      </div>
    )
  }
}

export const ImageBlockConfig = (options={})=>{
  let config =  {
    title: 'add an image',
    type: 'image',
    icon: image,
    block: ImageBlock,
    editable: true,
    renderable: true,
    breakOnContinuous: true,
    wrapper_class: "graf graf--figure",
    selected_class: "is-selected is-mediaFocused",
    selectedFn: block => {
      const { direction } = block.getData().toJS()
      switch (direction) {
        case "left":
          return "graf--layoutOutsetLeft"
        case "center":
          return ""
        case "wide":
          return "sectionLayout--fullWidth"
        case "fill":
          return "graf--layoutFillWidth"
        default:
          return ""
      }
    },
    handleEnterWithoutText(ctx, block) {
      const { editorState } = ctx.state
      return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
    },
    handleEnterWithText(ctx, block) {
      const { editorState } = ctx.state
      return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
    },
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "upload",
      insert_block: "image",
    },
    options: {
      upload_url: '',
      upload_headers: null,
      upload_formName: "file",
      upload_callback: null,
      upload_error_callback: null,
      delete_block_callback: null,
      image_caption_placeholder: "type a caption (optional)"
    }
  
  }
  
  return Object.assign(config, options)
}


