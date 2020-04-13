
import React from 'react'
import ReactDOM from 'react-dom'

import { EditorBlock } from 'draft-js'

export default class Column extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      enabled: false,
      data: this.props.blockProps.data.toJS()
    }
    this.placeholderRender = this.placeholderRender.bind(this)
  }

  componentDidMount() {}


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
      <div>
        {this.placeholderRender()}

        <EditorBlock {...Object.assign({}, this.props, {
          "editable": true })
        } />
      </div>
    )
  }
}
