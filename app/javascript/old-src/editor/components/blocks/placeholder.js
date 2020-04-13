
import React from 'react'
import ReactDOM from 'react-dom'

import { Entity, RichUtils, AtomicBlockUtils, EditorBlock } from 'draft-js'

export default class PlaceholderBlock extends React.Component {
  constructor(props) {
    super(props)
    this.placeholderText = this.placeholderText.bind(this)
    this.placeholderFromProps = this.placeholderFromProps.bind(this)
    this.defaultText = this.defaultText.bind(this)
    this.placeholderRender = this.placeholderRender.bind(this)
    this.state = {
      enabled: false,
      data: this.props.blockProps.data.toJS()
    }
  }

  placeholderText() {
    //if (this.state.enabled) {
    //  return ""
    //}
    return this.props.blockProps.data.toJS().placeholder || this.placeholderFromProps() || this.defaultText()
  }
  //if @.props.blockProps.data then @.props.blockProps.data.placeholder else @defaultText()


  placeholderFromProps() {
    return this.props.block.toJS().placeholder
  }

  defaultText() {
    return "write something "
  }

  placeholderRender(){
    if (this.props.block.text.length === 0 ) {
      return  (
        <div className="public-DraftEditorPlaceholder-root">
          <div className="public-DraftEditorPlaceholder-inner">
            {this.placeholderText() }
          </div>
        </div>
      )

    }
  }

  render() {
    return (
      <span onMouseDown={this.handleFocus}>
        
        {this.placeholderRender()}
        
        <EditorBlock {...Object.assign({}, this.props, {
          "className": "imageCaption",
          "placeholder": "escrive alalal"
        })} />
      </span>
    )
  }
}

