
import React from 'react'
import ReactDOM from 'react-dom'

import { Entity, RichUtils, AtomicBlockUtils, EditorBlock } from 'draft-js'

import { updateDataOfBlock } from '../../model/index.js'

import axios from "axios"

export default class VideoBlock extends React.Component {
  constructor(props) {
    super(props)
    //api_key = "86c28a410a104c8bb58848733c82f840"

    this.updateData = this.updateData.bind(this)
    this.dataForUpdate = this.dataForUpdate.bind(this)
    this.state = { embed_data: this.defaultData() }
  }

  defaultData() {
    let existing_data = this.props.block.getData().toJS()
    return existing_data.embed_data || {}
  }

  // will update block state
  updateData() {
    const { block, blockProps } = this.props
    const { getEditorState, setEditorState } = this.props.blockProps
    const data = block.getData()
    const newData = data.merge(this.state)
    return setEditorState(updateDataOfBlock(getEditorState(), block, newData))
  }

  dataForUpdate() {
    return this.props.blockProps.data.toJS()
  }

  componentDidMount() {

    if (!this.props.blockProps.data) {
      return
    }
    // ensure data isnt already loaded
    if (!this.dataForUpdate().endpoint && !this.dataForUpdate().provisory_text) {
      return
    }

    return axios({
      method: 'get',
      url: `${ this.dataForUpdate().endpoint }${ this.dataForUpdate().provisory_text }&scheme=https`
    }).then(result => {
      return this.setState({ embed_data: result.data } //JSON.parse(data.responseText)
      , this.updateData)
    }).catch(error => {
      return console.log("TODO: error")
    })
  }

  classForImage() {
    if (this.state.embed_data.thumbnail_url) {
      return ""
    } else {
      return "mixtapeImage--empty u-ignoreBlock"
    }
  }

  render() {
    return (
      <figure className='graf--figure graf--iframe graf--first' tabIndex='0'>
        <div className='iframeContainer' 
          dangerouslySetInnerHTML={ { __html: this.state.embed_data.html } } />
        <figcaption className='imageCaption'>
          <EditorBlock {...Object.assign({}, this.props, { "className": "imageCaption" })} />
        </figcaption>
      </figure>
    )
  }
}

