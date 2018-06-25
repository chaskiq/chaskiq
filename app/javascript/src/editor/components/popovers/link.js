
import React from 'react'
import ReactDOM from 'react-dom'

import { getCurrentBlock } from '../../model/index.js'


const getRelativeParent = (element) => {
  if (!element) {
    return null;
  }

  const position = window.getComputedStyle(element).getPropertyValue('position');
  if (position !== 'static') {
    return element;
  }

  return getRelativeParent(element.parentElement);
};


class DanteAnchorPopover extends React.Component {

  constructor(props) {

    super(props)
    this.display = this.display.bind(this)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.relocate = this.relocate.bind(this)
    this.render = this.render.bind(this)
    this.state = {
      position: {
        top: 0,
        left: 0
      },
      show: false,
      url: ""
    }
  }

  display(b) {
    if (b) {
      return this.show()
    } else {
      return this.hide()
    }
  }

  show() {
    return this.setState({
      show: true })
  }

  hide() {
    return this.setState({
      show: false })
  }

  setPosition(coords) {
    return this.setState({
      position: coords })
  }

  relocate(node) {
    if (node == null) {
      node = null
    }
    if (!node) {
      return
    }

    let { editorState } = this.props
    let currentBlock = getCurrentBlock(editorState)
    let blockType = currentBlock.getType()

    let contentState = editorState.getCurrentContent()
    let selectionState = editorState.getSelection()

    let selectionBoundary = node.getBoundingClientRect()
    let coords = selectionBoundary

    let el = this.refs.dante_popover
    let padd = el.offsetWidth / 2

    let parent = ReactDOM.findDOMNode(this.props.editor)
    let parentBoundary = parent.getBoundingClientRect()

    const toolbarHeight = el.offsetHeight;
    const relativeRect = node.getBoundingClientRect();
    let left = selectionBoundary.left + selectionBoundary.width / 2 - padd
    let top = relativeRect.top - parentBoundary.top + (toolbarHeight * 0.3)

    return {
      top: top,
      left: left
    }
  }

  render() {
    let { position } = this.state
    let style = {
      left: position.left,
      top: position.top,
      visibility: `${ this.state.show ? 'visible' : 'hidden' }`
    }
    return (
      <div
        ref="dante_popover"
        className='dante-popover popover--tooltip popover--Linktooltip popover--bottom is-active'
        style={ style }
        onMouseOver={ this.props.handleOnMouseOver }
        onMouseOut={ this.props.handleOnMouseOut }
      >
        <div className='popover-inner'>
          <a href={ this.state.url } target='_blank'>
            { this.state.url }
          </a>
        </div>
        <div className='popover-arrow' />
      </div>
    )
  }
}

export default DanteAnchorPopover

