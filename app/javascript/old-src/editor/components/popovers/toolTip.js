import React from 'react'
import ReactDOM from 'react-dom'
import DanteTooltipColor from './color'
import DanteTooltipList from './select'

import {
  getVisibleSelectionRect,
  Entity,
  RichUtils } from 'draft-js'

import { getSelectionRect, getSelection, getRelativeParent } from "../../utils/selection.js"

import { getCurrentBlock } from '../../model/index.js'

import Icons from "../icons.js"


class DanteTooltip extends React.Component {

  constructor(props) {
    super(props)
    this._clickInlineHandler = this._clickInlineHandler.bind(this)
    this.display = this.display.bind(this)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.relocate = this.relocate.bind(this)
    this._clickBlockHandler = this._clickBlockHandler.bind(this)
    this.displayLinkMode = this.displayLinkMode.bind(this)
    this.displayActiveMenu = this.displayActiveMenu.bind(this)
    this._enableLinkMode = this._enableLinkMode.bind(this)
    this._disableLinkMode = this._disableLinkMode.bind(this)
    this.handleInputEnter = this.handleInputEnter.bind(this)
    this.confirmLink = this.confirmLink.bind(this)
    this.inlineItems = this.inlineItems.bind(this)
    this.blockItems = this.blockItems.bind(this)
    this.getDefaultValue = this.getDefaultValue.bind(this)
    this.getVisibleSelectionRect = getVisibleSelectionRect
    this._clickBlockInlineStyle = this._clickBlockInlineStyle.bind(this)
    this.state = {
      link_mode: false,
      show: false,
      position: {}
    }
  }

  _clickInlineHandler(ev, style) {
    ev.preventDefault()

    this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, style))

    return setTimeout(() => {
      return this.relocate()
    }, 0)
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
      link_mode: false,
      show: false
    })
  }

  setPosition(coords) {
    return this.setState({
      position: coords })
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

    let currentBlock = getCurrentBlock(this.props.editorState)
    let blockType = currentBlock.getType()
    // display tooltip only for unstyled

    if (this.props.configTooltip.selectionElements.indexOf(blockType) < 0) {
      this.hide()
      return
    }

    if (this.state.link_mode) {
      return
    }
    if (!this.state.show) {
      return
    }

    let el = this.refs.dante_menu
    let padd = el.offsetWidth / 2

    let nativeSelection = getSelection(window)
    if (!nativeSelection.rangeCount) {
      return
    }

    let selectionBoundary = getSelectionRect(nativeSelection)

    let parent = ReactDOM.findDOMNode(this.props.editor)

    // hide if selected node is not in editor
    if (!this.isDescendant(parent, nativeSelection.anchorNode)) {
      this.hide()
      return
    }

    const relativeParent = getRelativeParent(this.refs.dante_menu.parentElement);
    const toolbarHeight = this.refs.dante_menu.clientHeight;
    const toolbarWidth = this.refs.dante_menu.clientWidth;
    const relativeRect = (relativeParent || document.body).getBoundingClientRect();
    const selectionRect = getVisibleSelectionRect(window);

    if(!selectionRect || !relativeRect || !selectionBoundary)
      return

    let top = (selectionRect.top - relativeRect.top) - toolbarHeight
    //let left = selectionBoundary.left + selectionBoundary.width / 2 - padd
    let left = (selectionRect.left - relativeRect.left + (selectionRect.width/2) ) - padd // - (toolbarWidth / 2 ) + 10

    //let left = (selectionRect.left - relativeRect.left) + (selectionRect.width / 2)

    if (!top || !left) {
      return
    }

    // console.log "SET SHOW FOR TOOLTIP INSERT MENU"
    return this.setState({
      show: true,
      position: {
        left,
        top
      }
    })
  }

  _clickBlockHandler(ev, style) {
    ev.preventDefault()
    this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, style))
    return setTimeout(() => {
      return this.relocate()
    }, 0)
  }

  _clickBlockInlineStyle(ev, style) {
    let k = Object.keys(style)[0]
    this.props.onChange(this.props.styles[k].toggle(this.props.editorState, style[k]))
    //this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, style))
    return setTimeout(() => {
      return this.relocate()
    }, 0)
  }

  displayLinkMode() {
    if (this.state.link_mode) {
      return "dante-menu--linkmode"
    } else {
      return ""
    }
  }

  displayActiveMenu() {
    if (this.state.show) {
      return "dante-menu--active"
    } else {
      return ""
    }
  }

  _enableLinkMode(ev) {
    ev.preventDefault()
    return this.setState({
      link_mode: true })
  }

  _disableLinkMode(ev) {
    ev.preventDefault()
    return this.setState({
      link_mode: false,
      url: ""
    })
  }

  hideMenu() {
    return this.hide()
  }

  handleInputEnter(e) {
    if (e.which === 13) {
      return this.confirmLink(e)
    }
  }

  confirmLink(e) {
    e.preventDefault()
    let { editorState } = this.props
    let urlValue = e.currentTarget.value
    let contentState = editorState.getCurrentContent()
    let selection = editorState.getSelection()

    let opts = {
      url: urlValue,
      showPopLinkOver: this.props.showPopLinkOver,
      hidePopLinkOver: this.props.hidePopLinkOver
    }

    let entityKey = Entity.create('LINK', 'MUTABLE', opts)
    //contentState.createEntity('LINK', 'MUTABLE', opts)

    if (selection.isCollapsed()) {
      console.log("COLLAPSED SKIPPING LINK")
      return
    }

    this.props.onChange(RichUtils.toggleLink(editorState, selection, entityKey))

    return this._disableLinkMode(e)
  }

  getPosition() {
    let pos = this.state.position
    return pos
  }

  inlineItems() {
    return this.props.widget_options.block_types.filter(o => {
      return o.type === "inline"
    })
  }

  blockItems() {
    return this.props.widget_options.block_types.filter(o => {
      return o.type === "block"
    })
  }

  getDefaultValue() {
    if (this.refs.dante_menu_input) {
      this.refs.dante_menu_input.value = ""
    }

    let currentBlock = getCurrentBlock(this.props.editorState)
    let blockType = currentBlock.getType()
    let selection = this.props.editor.state.editorState.getSelection()
    let contentState = this.props.editorState.getCurrentContent()
    let selectedEntity = null
    let defaultUrl = null
    return currentBlock.findEntityRanges(character => {
      let entityKey = character.getEntity()
      selectedEntity = entityKey
      return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK'
    }, (start, end) => {
      let selStart = selection.getAnchorOffset()
      let selEnd = selection.getFocusOffset()
      if (selection.getIsBackward()) {
        selStart = selection.getFocusOffset()
        selEnd = selection.getAnchorOffset()
      }

      if (start === selStart && end === selEnd) {
        defaultUrl = contentState.getEntity(selectedEntity).getData().url
        return this.refs.dante_menu_input.value = defaultUrl
      }
    })
  }

  render() {
    return (
      <div
        id="dante-menu"
        ref="dante_menu"
        className={ `dante-menu ${ this.displayActiveMenu() } ${ this.displayLinkMode() }` }
        style={ this.getPosition() }
      >
        <div className="dante-menu-linkinput">
          <input
            className="dante-menu-input"
            ref="dante_menu_input"
            placeholder={this.props.widget_options.placeholder}
            onKeyPress={ this.handleInputEnter }
            defaultValue={ this.getDefaultValue() }
          />
          <div className="dante-menu-button"
          onMouseDown={ this._disableLinkMode }>
            <span className={ 'dante-icon'}>
              {Icons['close']()}
            </span>
          </div>
        </div>
        <ul className="dante-menu-buttons">

          {
            /*
          }
          <DanteTooltipList
            editorState={ this.props.editorState }
            styles={this.props.styles}
            value={'Normal'}
            style_type="block"
            values={['unstyled', 'header-one', 'header-two']}
            items={['Normal', 'Title', 'Subtitle']}
            handleClick={(ev, style)=>{
              const types = {Normal: 'unstyled', Title: 'header-one', Subtitle: 'header-two' }

              this._clickBlockHandler(ev, types[style.block])
            }
          }
          />

          <DanteTooltipList
            editorState={ this.props.editorState }
            styles={this.props.styles}
            value={'Arial'}
            style_type="fontFamily"
            items={['Arial', 'Georgia', 'Helvetica',
                    'Tahoma', 'Times', 'Verdana']}
            handleClick={this._clickBlockInlineStyle}
          />

          <DanteTooltipList
            editorState={ this.props.editorState }
            items={
              [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                   22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 44, 48,
                   52, 56, 60].map( (n)=> { return `${n}px` } )
            }
            handleClick={this._clickBlockInlineStyle}
            value={"12px"}
            styles={this.props.styles}
            style_type="fontSize"
          />
          */}

          { this.props.widget_options.block_types.map( (item, i) => {
              switch (item.type) {
                case "block":
                  return <DanteTooltipItem
                            key={ i }
                            item={ item }
                            styles={this.props.style}
                            handleClick={ this._clickBlockHandler }
                            editorState={ this.props.editorState }
                            type="block"
                            currentStyle={ this.props.editorState.getCurrentInlineStyle }
                          />
                  break;

                case "inline":
                  return <DanteTooltipItem
                            key={ i }
                            item={ item }
                            type="inline"
                            editorState={ this.props.editorState }
                            handleClick={ this._clickInlineHandler }
                          />
                  break;
                
                case "color":
                  return <DanteTooltipColor
                            styles={this.props.styles}
                            editorState={ this.props.editorState }
                            enableLinkMode={ this._enableLinkMode }
                            value={'#000'}
                            style_type="color"
                            handleClick={this._clickBlockInlineStyle}
                            show={this.state.show}
                          />
                  break

                case "separator":
                  return <DanteMenuDivider/>
                  break;
                case "link": 
                  return <DanteTooltipLink
                            editorState={ this.props.editorState }
                            enableLinkMode={ this._enableLinkMode }
                          />
                  break;
                default:
                  break;
              }
              
            })
          }

          

        </ul>
      </div>
    )
  }
}

const DanteMenuDivider = ()=>{
  return <li className="dante-menu-divider"/>
} 

class DanteTooltipItem extends React.Component {

  constructor(...args) {
    super(...args)
    this.handleClick = this.handleClick.bind(this)
    this.activeClass = this.activeClass.bind(this)
    this.isActive = this.isActive.bind(this)
    this.activeClassInline = this.activeClassInline.bind(this)
    this.activeClassBlock = this.activeClassBlock.bind(this)
    this.render = this.render.bind(this)
  }

  handleClick(ev) {
    return this.props.handleClick(ev, this.props.item.style)
  }

  activeClass() {
    if (this.isActive()) {
      return "active"
    } else {
      return ""
    }
  }

  isActive() {
    if (this.props.type === "block") {
      return this.activeClassBlock()
    } else {
      return this.activeClassInline()
    }
  }

  activeClassInline() {
    if (!this.props.editorState) {
      return
    }
    return this.props.editorState.getCurrentInlineStyle().has(this.props.item.style)
  }

  activeClassBlock() {
    if (!this.props.editorState) {
      return
    }
    let selection = this.props.editorState.getSelection()
    let blockType = this.props.editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType()
    return this.props.item.style === blockType
  }

  render() {
    return (
      <li className={ `dante-menu-button ${ this.activeClass() }` }
        onMouseDown={ this.handleClick }>
        <span className={ 'dante-icon'}>
          {this.props.item.icon()}
        </span>
      </li>
    )
  }
}

class DanteTooltipLink extends React.Component {

  constructor(...args) {
    super(...args)
    this.promptForLink = this.promptForLink.bind(this)
  }

  promptForLink(ev) {
    let selection = this.props.editorState.getSelection()
    if (!selection.isCollapsed()) {
      return this.props.enableLinkMode(ev)
    }
  }

  render() {
    return (
      <li className="dante-menu-button"
        onMouseDown={ this.promptForLink }>
        <span className={ 'dante-icon'}>
          {Icons['link']()}
        </span>
      </li>
    )
  }
}

export default DanteTooltip