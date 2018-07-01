import React from 'react'
import ReactDOM from 'react-dom'

import {
  addNewBlock,
  resetBlockWithType,
  getCurrentBlock,
  getNode } from '../../model/index.js'

import { getSelectionRect, getSelection } from "../../utils/selection.js"

import Icons from "../icons.js"

class DanteInlineTooltip extends React.Component {

  constructor(props) {
    super(props)

    this.display = this.display.bind(this)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this._toggleScaled = this._toggleScaled.bind(this)
    this.scale = this.scale.bind(this)
    this.collapse = this.collapse.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.clickOnFileUpload = this.clickOnFileUpload.bind(this)
    this.handlePlaceholder = this.handlePlaceholder.bind(this)
    this.insertImage = this.insertImage.bind(this)
    this.handleFileInput = this.handleFileInput.bind(this)
    this.widgets = this.widgets.bind(this)
    this.clickHandler = this.clickHandler.bind(this)
    this.relocate = this.relocate.bind(this)
    this.state = {
      position: { top: 0, left: 0 },
      show: false,
      scaled: false,
      scaledWidth: "0px"
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

  _toggleScaled(ev) {
    if (this.state.scaled) {
      return this.collapse()
    } else {
      return this.scale()
    }
  }

  scale() {
    if(this.state.scaled){
      return
    }
    return this.setState({
      scaled: true }, ()=>{
        this.setState({scaledWidth: "300px"})
      })
  }

  collapse() {
    if(!this.state.scaled){
      return
    }
    return this.setState({
      scaled: false }, ()=>{
        setTimeout(()=>{
          this.setState({scaledWidth: "0px"})
        }, 300)

      })
  }

  componentWillReceiveProps(newProps) {
    return this.collapse()
  }

  activeClass() {
    //if @props.show then "is-active" else ""
    if (this.isActive()) {
      return "is-active"
    } else {
      return ""
    }
  }

  isActive() {
    return this.state.show
  }

  scaledClass() {
    if (this.state.scaled) {
      return "is-scaled"
    } else {
      return ""
    }
  }

  // expand , 1, widht 2. class
  // collapse , class, width

  clickOnFileUpload() {
    this.refs.fileInput.click()
    this.collapse()
    return this.hide()
  }

  handlePlaceholder(input) {
    let opts = {
      type: input.widget_options.insert_block,
      placeholder: input.options.placeholder,
      endpoint: input.options.endpoint
    }

    return this.props.onChange(resetBlockWithType(this.props.editorState, 'placeholder', opts))
  }

  insertImage(file) {
    let opts = {
      url: URL.createObjectURL(file),
      file
    }

    return this.props.onChange(addNewBlock(this.props.editorState, 'image', opts))
  }

  handleFileInput(e) {
    let fileList = e.target.files
    // TODO: support multiple file uploads
    /*
    Object.keys(fileList).forEach (o)=>
      @.insertImage(fileList[0])
    */
    return this.insertImage(fileList[0])
  }

  handleInsertion(e){
    this.hide()
    return this.props.onChange(addNewBlock(this.props.editorState, e.type, {}))
  }

  widgets() {
    return this.props.editor.widgets
  }

  clickHandler(e, type) {
    let request_block = this.widgets().find(o => o.icon === type)
    switch (request_block.widget_options.insertion) {
      case "upload":
        return this.clickOnFileUpload(e, request_block)
      case "placeholder":
        return this.handlePlaceholder(request_block)
      case "insertion":
        return this.handleInsertion(request_block)
      default:
        return console.log(`WRONG TYPE FOR ${ request_block.widget_options.insertion }`)
    }
  }

  getItems() {
    return this.widgets().filter(o => {
      return o.widget_options.displayOnInlineTooltip
    })
  }

  isDescendant(parent, child) {
    let node = child.parentNode
    while (node !== null) {
      if (node === parent) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  relocate() {
    let { editorState } = this.props

    if (editorState.getSelection().isCollapsed()) {

      let currentBlock = getCurrentBlock(editorState)
      let blockType = currentBlock.getType()

      let contentState = editorState.getCurrentContent()
      let selectionState = editorState.getSelection()

      let block = contentState.getBlockForKey(selectionState.anchorKey)

      let nativeSelection = getSelection(window)
      if (!nativeSelection.rangeCount) {
        return
      }

      let selectionBoundary = getSelectionRect(nativeSelection)
      let coords = selectionBoundary //utils.getSelectionDimensions(node)

      let parent = ReactDOM.findDOMNode(this.props.editor)
      let parentBoundary = parent.getBoundingClientRect()

      if (!this.isDescendant(parent, nativeSelection.anchorNode)) {
        this.hide()
        return
      }

      // checkeamos si esta vacio
      this.display(block.getText().length === 0 && blockType === "unstyled")
      return this.setPosition({
        top: coords.top + window.scrollY,
        left: (selectionBoundary.left - parentBoundary.left ) + this.refs.tooltip.clientWidth //coords.left + window.scrollX - 60
      })


    } else {
      return this.hide()
    }
  }

  render() {
    return (
      <div
        ref="tooltip"
        className={ `inlineTooltip ${ this.activeClass() } ${ this.scaledClass() }` }
        style={ this.state.position }
      >
        <button
          className="inlineTooltip-button control"
          title="Close Menu"
          data-action="inline-menu"
          onClick={ this._toggleScaled }
        >
          <span className="tooltip-icon dante-icon-plus" />
        </button>
        <div
           className="inlineTooltip-menu"
           style={ { width: `${ this.state.scaledWidth }` } }
         >
          { this.getItems().map( (item, i) => {
            return  <InlineTooltipItem
                      item={ item }
                      key={ i }
                      clickHandler={ this.clickHandler }
                    />
            })
          }
          <input
           type="file"
           style={ { display: 'none' } }
           ref="fileInput"
           multiple="multiple"
           onChange={ this.handleFileInput }
         />
        </div>
      </div>
    )
  }
}

class InlineTooltipItem extends React.Component {

  constructor(...args) {
    super(...args)
    this.clickHandler = this.clickHandler.bind(this)
  }

  clickHandler(e) {
    e.preventDefault()
    return this.props.clickHandler(e, this.props.item.icon)
  }

  render() {
    return (
      <button
        className="inlineTooltip-button scale"
        title={ this.props.title }
        onMouseDown={ this.clickHandler }
        style={{fontSize: '21px'}}
      >
      {
        <span className={ 'tooltip-icon'}>
          {Icons[this.props.item.icon]()}
        </span>
      }
      </button>
    )
  }
}

export default DanteInlineTooltip

