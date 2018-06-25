
import React from 'react'
import { EditorBlock } from 'draft-js'
import axios from "axios"

import { updateDataOfBlock } from '../../model/index.js'


export default class CardBlock extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      image: "http://via.placeholder.com/100x100"
    }

    this.config = this.props.blockProps.config
    this.placeholderRender = this.placeholderRender.bind(this)
    this.setImage = this.setImage.bind(this)
    this.updateData = this.updateData.bind(this)
  }

  setImage(image){
    this.setState({image: image}, this.updateData)
  }

  // will update block state
  updateData() {
    let { blockProps } = this.props
    let { block } = this.props
    let { getEditorState } = this.props.blockProps
    let { setEditorState } = this.props.blockProps
    let data = block.getData()
    let newData = data.merge(this.state).merge({ forceUpload: false })
    return setEditorState(updateDataOfBlock(getEditorState(), block, newData))
  }

  placeholderRender(){
    if (this.props.block.text.length === 0 ) {
      return  (
        <div className="public-DraftEditorPlaceholder-root">
          <div className="public-DraftEditorPlaceholder-inner">
            {"write something" }
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <div style={{ width: '100%',
                    height: '100px',
                    margin: '18px 0px 47px'}}>
          <div className="signature">
            <CardImage 
              image={this.state.image}
              setImage={this.setImage}
              config={this.config}
              {...this.props}
            />
            <div className="text" 
              style={{
                "color": 'rgb(153, 153, 153)', 
                "fontSize": '12px', 
                "fontWeight": 'bold'}}>
              
              {this.placeholderRender()}

              <EditorBlock {...Object.assign({}, this.props, { 
                "editable": true })
              } />
            </div>
          </div>
        <div className="dante-clearfix"/>
      </div>
    )
  }
}

class CardImage extends React.Component {

  constructor(props) {
    super(props)
    this.handleFileInput = this.handleFileInput.bind(this)
    this.clickOnFileUpload = this.clickOnFileUpload.bind(this)
    //upload bindings
    this.handleUpload = this.handleUpload.bind(this)
    this.uploadFailed = this.uploadFailed.bind(this)
    this.uploadCompleted = this.uploadCompleted.bind(this)
    this.updateProgressBar = this.updateProgressBar.bind(this)
    this.startLoader = this.startLoader.bind(this)
    this.stopLoader = this.stopLoader.bind(this)
    this.getUploadUrl = this.getUploadUrl.bind(this)
    this.file = null

    this.state = {
      loading: false,
      selected: false,
      loading_progress: 0,
      file: null
    }
  }

  clickOnFileUpload(ev) {
    ev.preventDefault()
    this.refs.fileInput.click()
    //ev.preventDefault()
  }

  handleFileInput(e) {
    let fileList = e.target.files
    return this.insertImage(fileList[0])
  }

  insertImage(file) {
    let opts = {
      url: URL.createObjectURL(file),
      file
    }

    this.file = file

    this.props.setImage(opts.url)
    this.handleUpload()
    //return this.props.onChange(addNewBlock(this.props.editorState, 'image', opts))
  }

  getUploadHeaders()  {
   return this.props.config.upload_headers || {}
  }

  getUploadUrl() {
    let url = this.props.config.upload_url
    if (typeof url === "function") {
      return url()
    } else {
      return url
    }
  }

  handleUpload() {
    this.startLoader()
    this.props.blockProps.addLock()
    //this.updateData()
    return this.uploadFile()
  }

  uploadFailed() {
    this.props.blockProps.removeLock()
    this.stopLoader()
  }

  uploadCompleted(url) {
    this.props.setImage(url)
    //this.setState({ url }, this.updateData)
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

  uploadFile() {
    let handleUp
    // custom upload handler
    if (this.props.config.upload_handler) {
      return this.props.config.upload_handler(this.formatData().get('file'), this)
    }

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

      if (this.props.config.upload_callback) {
        return this.props.config.upload_callback(result, this)
      }
    }).catch(error => {
      this.uploadFailed()

      console.log(`ERROR: got error uploading file ${ error }`)
      if (this.props.config.upload_error_callback) {
        return this.props.config.upload_error_callback(error, this)
      }
    })

    return handleUp = json_response => {
      return this.uploadCompleted(json_response.url)
    }
  }

  formatData() {
    let formData = new FormData()
    if (this.file) {
      let formName = this.props.config.upload_formName || 'file'

      formData.append(formName, this.file)
      return formData
    } else {
      // TODO: check this 
      formData.append('url', this.props.blockProps.data.get("url"))
      return formData
    }
  }

  startLoader() {
    return this.setState({
      loading: true })
  }

  stopLoader() {
    return this.setState({
      loading: false })
  }

  render(){

    return (  
      <div>
        <a href="#" contentEditable="false" 
          onClick={this.clickOnFileUpload}>
          <img src={this.props.image}/>
          <Loader toggle={this.state.loading} 
            progress={this.state.loading_progress} />
        </a>
        <input
           type="file"
           style={ { display: 'none' } }
           ref="fileInput"
           onChange={ this.handleFileInput }
         />

      </div>
    )
  }
}

class Loader extends React.Component {

  render() {
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