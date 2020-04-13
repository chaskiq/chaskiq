
import React from 'react'
import ReactDOM from 'react-dom'

//import { Entity, RichUtils, AtomicBlockUtils, EditorBlock } from 'draft-js'

export default class DividerBlock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      enabled: false,
      data: this.props.blockProps.data.toJS()
    }
  }

  componentDidMount() {}


  render() {
    return (
      <hr/>
    )
  }
}

