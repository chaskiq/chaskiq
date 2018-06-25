
import React from 'react'
import ReactDOM from 'react-dom'

import { Entity, RichUtils, AtomicBlockUtils, EditorBlock } from 'draft-js'

import axios from "axios"

import { updateDataOfBlock } from '../../model/index.js'

export default class EmbedBlock extends React.Component {
  constructor(props) {
    super(props)
    //api_key = "86c28a410a104c8bb58848733c82f840"

    this.updateData = this.updateData.bind(this)
    this.dataForUpdate = this.dataForUpdate.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.state = {
      embed_data: this.defaultData(),
      error: ""
    }
  }

  defaultData() {
    const existing_data = this.props.block.getData().toJS()
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
    // unless @dataForUpdate().endpoint or @dataForUpdate().provisory_text

    if (!this.dataForUpdate().endpoint && !this.dataForUpdate().provisory_text) {
      //debugger
      return
    }

    return axios({
      method: 'get',
      url: `${ this.dataForUpdate().endpoint }${ this.dataForUpdate().provisory_text }&scheme=https`
    }).then(result => {

      return this.setState({ embed_data: result.data } //JSON.parse(data.responseText)
      , this.updateData)
    }).catch(error => {

      this.setState({
        error: error.response.data.error_message })
      return console.log("TODO: error")
    })
  }

  classForImage() {
    if (this.state.embed_data.images) {
      return ""
    } else {
      return "mixtapeImage--empty u-ignoreBlock"
    }
  }
  //if @state.embed_data.thumbnail_url then "" else "mixtapeImage--empty u-ignoreBlock"

  picture() {
    if (this.state.embed_data.images && this.state.embed_data.images.length > 0) {
      return this.state.embed_data.images[0].url
    } else {
      return ""
    }
  }

  render() {
    //block = @.props
    //foo = @.props.blockProps
    //data = Entity.get(block.block.getEntityAt(0)).getData()
    console.log("ERROR", this.state.error)
    return (
      <span>
        { this.picture()
          ? <a
              target='_blank'
              className={ `js-mixtapeImage mixtapeImage ${ this.classForImage() }` }
              href={ this.state.embed_data.url }
              style={ { backgroundImage: `url('${ this.picture() }')` } }
            />
          : undefined
        }
        { this.state.error ? 
          <h2>{ this.state.error }</h2>
          : undefined
        }
        <a
          className='markup--anchor markup--mixtapeEmbed-anchor'
          target='_blank'
          href={ this.state.embed_data.url }
        >
          <strong className='markup--strong markup--mixtapeEmbed-strong'>
            { this.state.embed_data.title }
          </strong>
          <em className='markup--em markup--mixtapeEmbed-em'>
            { this.state.embed_data.description }
          </em>
        </a>{ this.state.embed_data.provider_url }
      </span>
    )
  }
}

