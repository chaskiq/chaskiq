
import React from 'react'
import ReactDOM from 'react-dom'
import Immutable from 'immutable'
import { Map, fromJS } from 'immutable'
import { 
  convertToRaw, 
  convertFromRaw, 
  CompositeDecorator, 
  getDefaultKeyBinding,
  ContentState, 
  Editor, 
  EditorState, 
  Entity, 
  RichUtils, 
  DefaultDraftBlockRenderMap, 
  SelectionState, 
  Modifier
} from 'draft-js'

/*import { 
  convertToHTML,
} from 'draft-convert'*/

import { 
  addNewBlock, 
  resetBlockWithType, 
  updateDataOfBlock, 
  //updateTextOfBlock, 
  getCurrentBlock, 
  addNewBlockAt 
} from '../model/index.js'

import DraggableElements from "./draggable_elements"

import Link from '../components/decorators/link'
import Debug from './debug'
import findEntities from '../utils/find_entities'
import SaveBehavior from '../utils/save_content'
import customHTML2Content from '../utils/html2content'
import createStyles from 'draft-js-custom-styles'


class DanteEditor extends React.Component {
  constructor(props) {
    super(props)

    this.initializeState = this.initializeState.bind(this)
    this.refreshSelection = this.refreshSelection.bind(this)
    this.forceRender = this.forceRender.bind(this)
    this.onChange = this.onChange.bind(this)
    this.dispatchChangesToSave = this.dispatchChangesToSave.bind(this)
    this.setPreContent = this.setPreContent.bind(this)
    this.focus = this.focus.bind(this)
    this.getEditorState = this.getEditorState.bind(this)
    this.emitSerializedOutput = this.emitSerializedOutput.bind(this)
    this.decodeEditorContent = this.decodeEditorContent.bind(this)
    this.getTextFromEditor = this.getTextFromEditor.bind(this)
    this.getLocks = this.getLocks.bind(this)
    this.addLock = this.addLock.bind(this)
    this.removeLock = this.removeLock.bind(this)
    this.renderableBlocks = this.renderableBlocks.bind(this)
    this.defaultWrappers = this.defaultWrappers.bind(this)
    this.blockRenderer = this.blockRenderer.bind(this)
    this.handleBlockRenderer = this.handleBlockRenderer.bind(this)
    this.blockStyleFn = this.blockStyleFn.bind(this)
    this.getDataBlock = this.getDataBlock.bind(this)
    this.styleForBlock = this.styleForBlock.bind(this)
    this.handlePasteText = this.handlePasteText.bind(this)
    this.handleTXTPaste = this.handleTXTPaste.bind(this)
    this.handleHTMLPaste = this.handleHTMLPaste.bind(this)
    this.handlePasteImage = this.handlePasteImage.bind(this)
    this.handleDroppedFiles = this.handleDroppedFiles.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleUpArrow = this.handleUpArrow.bind(this)
    this.handleDownArrow = this.handleDownArrow.bind(this)
    this.handleReturn = this.handleReturn.bind(this)
    this.handleBeforeInput = this.handleBeforeInput.bind(this)
    this.handleKeyCommand = this.handleKeyCommand.bind(this)
    this.findCommandKey = this.findCommandKey.bind(this)
    this.KeyBindingFn = this.KeyBindingFn.bind(this)
    this.updateBlockData = this.updateBlockData.bind(this)
    this.setDirection = this.setDirection.bind(this)
    this.toggleEditable = this.toggleEditable.bind(this)
    this.disableEditable = this.disableEditable.bind(this)
    this.enableEditable = this.enableEditable.bind(this)
    this.closePopOvers = this.closePopOvers.bind(this)
    this.relocateTooltips = this.relocateTooltips.bind(this)
    this.tooltipsWithProp = this.tooltipsWithProp.bind(this)
    this.tooltipHasSelectionElement = this.tooltipHasSelectionElement.bind(this)
    this.handleShowPopLinkOver = this.handleShowPopLinkOver.bind(this)
    this.handleHidePopLinkOver = this.handleHidePopLinkOver.bind(this)
    this.showPopLinkOver = this.showPopLinkOver.bind(this)
    this.hidePopLinkOver = this.hidePopLinkOver.bind(this)
    this.render = this.render.bind(this)

    this.decorator = new CompositeDecorator([{
      strategy: findEntities.bind(null, 'LINK', this),
      component: Link
    }])

    this.blockRenderMap = Map({
      "image": {
        element: 'figure'
      },
      "video": {
        element: 'figure'
      },
      "embed": {
        element: 'div'
      },
      'unstyled': {
        wrapper: null,
        element: 'div'
      },
      'paragraph': {
        wrapper: null,
        element: 'div'
      },
      'placeholder': {
        wrapper: null,
        element: 'div'
      }

    })

    this.extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(this.blockRenderMap)

    this.state = {
      editorState: EditorState.createEmpty(),
      read_only: this.props.config.read_only,
      blockRenderMap: this.extendedBlockRenderMap,
      locks: 0,
      debug: this.props.config.debug
    }

    this.widgets = this.props.config.widgets
    this.tooltips = this.props.config.tooltips

    this.key_commands = this.props.config.key_commands

    this.continuousBlocks = this.props.config.continuousBlocks

    this.block_types = this.props.config.block_types

    this.default_wrappers = this.props.config.default_wrappers

    this.character_convert_mapping = this.props.config.character_convert_mapping

    const { styles, customStyleFn, exporter } = createStyles(['font-size', 'color', 'font-family']);  //, 'PREFIX', customStyleMap);
    this.styles = styles
    this.customStyleFn = customStyleFn
    this.styleExporter = exporter

    this.save = new SaveBehavior({
      getLocks: this.getLocks,
      config: {
        xhr: this.props.config.xhr,
        data_storage: this.props.config.data_storage
      },
      editor: this,
      editorState: this.getEditorState,
      editorContent: this.emitSerializedOutput()
    })

  }

  componentDidMount(){
    this.initializeState()
    window.addEventListener('resize', ()=> {
      if(this.relocateTooltips)
        setTimeout(() => {
          return this.relocateTooltips()
        })
    })
  }

  initializeState() {
    let newEditorState = EditorState.createEmpty(this.decorator)
    if (this.props.content) {
      newEditorState = EditorState.set(this.decodeEditorContent(this.props.content), {decorator: this.decorator});
    }
    this.onChange(newEditorState)      
  }

  decodeEditorContent(raw_as_json) {
    const new_content = convertFromRaw(raw_as_json)
    let editorState
    return editorState = EditorState.createWithContent(new_content, this.decorator)
  }

  refreshSelection(newEditorState) {
    const { editorState } = this.state
    // Setting cursor position after inserting to content
    const s = this.state.editorState.getSelection()
    const c = editorState.getCurrentContent()
    const focusOffset = s.getFocusOffset()
    const anchorKey = s.getAnchorKey()

    let selectionState = SelectionState.createEmpty(s.getAnchorKey())

    // console.log anchorKey, focusOffset
    selectionState = selectionState.merge({
      anchorOffset: focusOffset,
      focusKey: anchorKey,
      focusOffset
    })

    let newState = EditorState.forceSelection(newEditorState, selectionState)

    return this.onChange(newState)
  }

  forceRender(editorState) {
    const selection = this.state.editorState.getSelection()
    const content = editorState.getCurrentContent()
    const newEditorState = EditorState.createWithContent(content, this.decorator)

    return this.refreshSelection(newEditorState)
  }

  onChange(editorState) {

    editorState = this.handleUndeletables(editorState)

    this.setPreContent()
    this.setState({ editorState })

    const currentBlock = getCurrentBlock(this.state.editorState)
    const blockType = currentBlock.getType()


    if (!editorState.getSelection().isCollapsed()) {
      const tooltip = this.tooltipsWithProp('displayOnSelection')[0]
      if (!this.tooltipHasSelectionElement(tooltip, blockType)) {
        return
      }
      this.handleTooltipDisplayOn('displayOnSelection')
    } else {
      this.handleTooltipDisplayOn('displayOnSelection', false)
    }

    setTimeout(() => {
      return this.relocateTooltips()
    })

    return this.dispatchChangesToSave()
  }

  handleUndeletables(editorState){
    // undeletable behavior, will keep previous blockMap 
    // if undeletables are deleted
    const undeletable_types = this.widgets.filter(
      function(o){ return o.undeletable })
    .map(function(o){ return o.type })
    
    const currentblockMap = this.state.editorState.getCurrentContent().get("blockMap")
    const blockMap = editorState.getCurrentContent().get("blockMap")

    const undeletablesMap = blockMap
    .filter(function(o){ 
      return undeletable_types.indexOf(o.get("type")) > 0 
    })

    if (undeletable_types.length > 0 && undeletablesMap.size === 0) {

      const contentState = editorState.getCurrentContent();
      const blockMap = contentState.getBlockMap();
      const newContentState = contentState.merge({
        blockMap: this.state.editorState.getCurrentContent().blockMap,
        selectionBefore: contentState.getSelectionAfter()
      });

      return editorState = EditorState.push(editorState, newContentState, 'change-block')
    }

    return editorState
  }

  dispatchChangesToSave() {
    clearTimeout(this.saveTimeout)
    return this.saveTimeout = setTimeout(() => {
      return this.save.store(this.emitSerializedOutput())
    }, 100)
  }

  setPreContent() {
    const content = this.emitSerializedOutput()
    return this.save.editorContent = content
  }

  focus() {
    //debugger
  }
  //@props.refs.richEditor.focus()

  getEditorState() {
    return this.state.editorState
  }

  emitSerializedOutput() {
    const raw = convertToRaw(this.state.editorState.getCurrentContent())
    return raw
  }


  //# title utils
  getTextFromEditor() {
    const c = this.state.editorState.getCurrentContent()
    const out = c.getBlocksAsArray().map(o => {
      return o.getText()
    }).join("\n")

    return out
  }

  emitHTML2() {
    let html

    return html = convertToHTML({
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return `<a href=\"${ entity.data.url }\">${ originalText }</a>`
        } else {
          return originalText
        }
      }

    })(this.state.editorState.getCurrentContent())
  }

  getLocks() {
    return this.state.locks
  }

  addLock() {
    return this.setState({
      locks: this.state.locks += 1 })
  }

  removeLock() {
    return this.setState({
      locks: this.state.locks -= 1 })
  }

  renderableBlocks() {
    return this.widgets.filter(o => o.renderable).map(o => o.type)
  }

  defaultWrappers(blockType) {
    return this.default_wrappers.filter(o => {
      return o.block === blockType
    }).map(o => o.className)
  }

  blockRenderer(block) {

    switch (block.getType()) {

      case "atomic":

        const entity = block.getEntityAt(0)
        const entity_type = Entity.get(entity).getType()

        break
    }

    if (this.renderableBlocks().includes(block.getType())) {
      return this.handleBlockRenderer(block)
    }

    return null
  }

  handleBlockRenderer(block) {
    const dataBlock = this.getDataBlock(block)
    if (!dataBlock) {
      return null
    }

    const read_only = this.state.read_only ? false : null
    const editable = read_only !== null ? read_only : dataBlock.editable
    return {
      component: eval(dataBlock.block),
      editable,
      props: {
        data: block.getData(),
        getEditorState: this.getEditorState,
        setEditorState: this.onChange,
        addLock: this.addLock,
        toggleEditable: this.toggleEditable,
        disableEditable: this.disableEditable,
        enableEditable: this.enableEditable,
        removeLock: this.removeLock,
        getLocks: this.getLocks,
        config: dataBlock.options
      }
    }

    return null
  }

  blockStyleFn(block) {
    const currentBlock = getCurrentBlock(this.state.editorState)
    const is_selected = currentBlock.getKey() === block.getKey() ? "is-selected" : ""

    if (this.renderableBlocks().includes(block.getType())) {
      return this.styleForBlock(block, currentBlock, is_selected)
    }

    const defaultBlockClass = this.defaultWrappers(block.getType())
    if (defaultBlockClass.length > 0) {
      return `graf ${ defaultBlockClass[0] } ${ is_selected }`
    } else {
      return `graf ${ is_selected }`
    }
  }

  getDataBlock(block) {
    return this.widgets.find(o => {
      return o.type === block.getType()
    })
  }

  styleForBlock(block, currentBlock, is_selected) {
    const dataBlock = this.getDataBlock(block)

    if (!dataBlock) {
      return null
    }

    const selectedFn = dataBlock.selectedFn ? dataBlock.selectedFn(block) : ''
    const selected_class = (dataBlock.selected_class ? dataBlock.selected_class : '' )
    const selected_class_out = is_selected ? selected_class : ''

    return `${ dataBlock.wrapper_class } ${ selected_class_out } ${ selectedFn }`
  }

  handleTooltipDisplayOn(prop, display) {

    // for button click on after inline style set, 
    // avoids inline popver to reappear on previous selection
    if(this.state.read_only){
      return  
    }

    if (display == null) {
      display = true
    }
    
    return setTimeout(() => {
      const items = this.tooltipsWithProp(prop)
      console.log(items)
      return items.map(o => {
        this.refs[o.ref].display(display)
        return this.refs[o.ref].relocate()
      })
    }, 20)
  }

  handlePasteText(text, html) {

    // https://github.com/facebook/draft-js/issues/685
    /*
    html = "<p>chao</p>
    <avv>aaa</avv>
    <p>oli</p>
    <img src='x'/>"
    */

    // if not html then fallback to default handler

    if (!html) {
      return this.handleTXTPaste(text, html)
    }
    if (html) {
      return this.handleHTMLPaste(text, html)
    }
  }

  handleTXTPaste(text, html) {
    const currentBlock = getCurrentBlock(this.state.editorState)

    let { editorState } = this.state

    switch (currentBlock.getType()) {
      case "image":case "video":case "placeholder":
        const newContent = Modifier.replaceText(editorState.getCurrentContent(), new SelectionState({
          anchorKey: currentBlock.getKey(),
          anchorOffset: 0,
          focusKey: currentBlock.getKey(),
          focusOffset: 2
        }), text)

        editorState = EditorState.push(editorState, newContent, 'replace-text')

        this.onChange(editorState)

        return true
      default:
        return false
    }
  }

  handleHTMLPaste(text, html) {

    const currentBlock = getCurrentBlock(this.state.editorState)

    // TODO: make this configurable
    switch (currentBlock.getType()) {
      case "image":case "video":case "placeholder":
        return this.handleTXTPaste(text, html)
        break
    }

    const newContentState = customHTML2Content(html, this.extendedBlockRenderMap)

    const selection = this.state.editorState.getSelection()
    const endKey = selection.getEndKey()

    const content = this.state.editorState.getCurrentContent()
    const blocksBefore = content.blockMap.toSeq().takeUntil(v => v.key === endKey)
    const blocksAfter = content.blockMap.toSeq().skipUntil(v => v.key === endKey).rest()

    const newBlockKey = newContentState.blockMap.first().getKey()

    const newBlockMap = blocksBefore.concat(newContentState.blockMap, blocksAfter).toOrderedMap()

    const newContent = content.merge({
      blockMap: newBlockMap,
      selectionBefore: selection,
      selectionAfter: selection.merge({
        anchorKey: newBlockKey,
        anchorOffset: 0,
        focusKey: newBlockKey,
        focusOffset: 0,
        isBackward: false
      })
    })

    const pushedContentState = EditorState.push(this.state.editorState, newContent, 'insert-fragment')

    this.onChange(pushedContentState)

    return true
  }

  handlePasteImage(files) {
    //TODO: check file types
    return files.map(file => {
      let opts = {
        url: URL.createObjectURL(file),
        file
      }

      return this.onChange(addNewBlock(this.state.editorState, 'image', opts))
    })
  }

  handleDroppedFiles(state, files) {
    return files.map(file => {
      let opts = {
        url: URL.createObjectURL(file),
        file
      }

      return this.onChange(addNewBlock(this.state.editorState, 'image', opts))
    })
  }

  handleDrop(selection, dataTransfer, isInternal){

    const editorState = this.getEditorState();

    const raw = dataTransfer.data.getData('text');

    const data = JSON.parse(raw);

    this.onChange(addNewBlock(editorState, data.type, data.data))

    return 'handled';
  }

  handleUpArrow(e) {
    return setTimeout(() => {
      return this.forceRender(this.state.editorState)
    }, 10)
  }

  handleDownArrow(e) {
    return setTimeout(() => {
      return this.forceRender(this.state.editorState)
    }, 10)
  }

  handleReturn(e) {
    if (this.props.handleReturn) {
      if (this.props.handleReturn()) {
        return true
      }
    }

    let { editorState } = this.state

    if (e.shiftKey) {
      this.setState({ editorState: RichUtils.insertSoftNewline(editorState) });
      return true;
    }


    if (!e.altKey && !e.metaKey && !e.ctrlKey) {
      const currentBlock = getCurrentBlock(editorState)
      const blockType = currentBlock.getType()
      const selection = editorState.getSelection()

      const config_block = this.getDataBlock(currentBlock)

      if (currentBlock.getText().length === 0) {

        if (config_block && config_block.handleEnterWithoutText) {
          config_block.handleEnterWithoutText(this, currentBlock)
          this.closePopOvers()
          return true
        }

        //TODO turn this in configurable
        switch (blockType) {
          case "header-one":
            this.onChange(resetBlockWithType(editorState, "unstyled"))
            return true
            break
          default:
            return false
        }
      }

      if (currentBlock.getText().length > 0) {

        if (config_block && config_block.handleEnterWithText) {
          config_block.handleEnterWithText(this, currentBlock)
          this.closePopOvers()
          return true
        }

        if (currentBlock.getLength() === selection.getStartOffset()) {
          if (this.continuousBlocks.indexOf(blockType) < 0) {
            this.onChange(addNewBlockAt(editorState, currentBlock.getKey()))
            return true
          }
        }

        return false
      }

      // selection.isCollapsed() and # should we check collapsed here?
      if (currentBlock.getLength() === selection.getStartOffset()) {
        //or (config_block && config_block.breakOnContinuous))
        // it will match the unstyled for custom blocks
        if (this.continuousBlocks.indexOf(blockType) < 0) {
          this.onChange(addNewBlockAt(editorState, currentBlock.getKey()))
          return true
        }
        return false
      }

      return false
    }
  }

  //return false

  // TODO: make this configurable
  handleBeforeInput(chars) {
    const currentBlock = getCurrentBlock(this.state.editorState)
    const blockType = currentBlock.getType()
    const selection = this.state.editorState.getSelection()

    let { editorState } = this.state

    // close popovers
    if (currentBlock.getText().length !== 0) {
      //@closeInlineButton()
      this.closePopOvers()
    }

    // handle space on link
    const endOffset = selection.getEndOffset()
    const endKey = currentBlock.getEntityAt(endOffset - 1)
    const endEntityType = endKey && Entity.get(endKey).getType()
    const afterEndKey = currentBlock.getEntityAt(endOffset)
    const afterEndEntityType = afterEndKey && Entity.get(afterEndKey).getType()

    // will insert blank space when link found
    if (chars === ' ' && endEntityType === 'LINK' && afterEndEntityType !== 'LINK') {
      const newContentState = Modifier.insertText(editorState.getCurrentContent(), selection, ' ')
      const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters')
      this.onChange(newEditorState)
      return true
    }

    // block transform
    if (blockType.indexOf('atomic') === 0) {
      return false
    }

    const blockLength = currentBlock.getLength()
    if (selection.getAnchorOffset() > 1 || blockLength > 1) {
      return false
    }

    const blockTo = this.character_convert_mapping[currentBlock.getText() + chars]

    console.log(`BLOCK TO SHOW: ${ blockTo }`)

    if (!blockTo) {
      return false
    }

    this.onChange(resetBlockWithType(editorState, blockTo))

    return true
  }

  // TODO: make this configurable
  handleKeyCommand(command) {
    const { editorState } = this.state
    let currentBlockType, newBlockType

    if (this.props.handleKeyCommand && this.props.handleKeyCommand(command)) {
      return true
    }

    if (command === 'add-new-block') {
      this.onChange(addNewBlock(editorState, 'blockquote'))
      return true
    }

    const block = getCurrentBlock(editorState)

    if (command.indexOf('toggle_inline:') === 0) {
      newBlockType = command.split(':')[1]
      currentBlockType = block.getType()
      this.onChange(RichUtils.toggleInlineStyle(editorState, newBlockType))
      return true
    }

    if (command.indexOf('toggle_block:') === 0) {
      newBlockType = command.split(':')[1]
      currentBlockType = block.getType()

      this.onChange(RichUtils.toggleBlockType(editorState, newBlockType))
      return true
    }

    const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }

    return false
  }

  findCommandKey(opt, command) {
    // console.log "COMMAND find: #{opt} #{command}"
    return this.key_commands[opt].find(o => o.key === command)
  }

  KeyBindingFn(e) {

    //⌘ + B / Ctrl + B   Bold
    //⌘ + I / Ctrl + I   Italic
    //⌘ + K / Ctrl + K   Turn into link
    //⌘ + Alt + 1 / Ctrl + Alt + 1   Header
    //⌘ + Alt + 2 / Ctrl + Alt + 2   Sub-Header
    //⌘ + Alt + 5 / Ctrl + Alt + 5   Quote (Press once for a block quote, again for a pull quote and a third time to turn off quote)

    let cmd
    if (e.altKey) {
      if (e.shiftKey) {
        cmd = this.findCommandKey("alt-shift", e.which)
        if (cmd) {
          return cmd.cmd
        }

        return getDefaultKeyBinding(e)
      }

      if (e.ctrlKey || e.metaKey) {
        cmd = this.findCommandKey("alt-cmd", e.which)
        if (cmd) {
          return cmd.cmd
        }
        return getDefaultKeyBinding(e)
      }
    } else if (e.ctrlKey || e.metaKey) {
      cmd = this.findCommandKey("cmd", e.which)
      if (cmd) {
        return cmd.cmd
      }
      return getDefaultKeyBinding(e)
    }

    return getDefaultKeyBinding(e)
  }

  // will update block state todo: movo to utils
  updateBlockData(block, options) {
    const data = block.getData()
    const newData = data.merge(options)
    const newState = updateDataOfBlock(this.state.editorState, block, newData)
    // this fixes enter from image caption
    return this.forceRender(newState)
  }

  setDirection(direction_type) {
    const contentState = this.state.editorState.getCurrentContent()
    const selectionState = this.state.editorState.getSelection()
    const block = contentState.getBlockForKey(selectionState.anchorKey)

    return this.updateBlockData(block, { direction: direction_type })
  }

  //# read only utils
  toggleEditable() {
    this.closePopOvers()
    return this.setState({ read_only: !this.state.read_only }, this.testEmitAndDecode)
  }

  disableEditable() {
    console.log("in !!")
    this.closePopOvers()
    return this.setState({ read_only: true }, this.testEmitAndDecode)
  }

  enableEditable() {
    this.closePopOvers()
    console.log("out !!")
    return this.setState({ read_only: false }, this.testEmitAndDecode)
  }

  closePopOvers() {
    return this.tooltips.map(o => {
      return this.refs[o.ref].hide()
    })
  }

  relocateTooltips() {
    if (this.state.read_only)
      return 
    return this.tooltips.map(o => {
      return this.refs[o.ref].relocate()
    })
  }

  tooltipsWithProp(prop) {
    return this.tooltips.filter(o => {
      return o[prop]
    })
  }

  tooltipHasSelectionElement(tooltip, element) {
    return tooltip.selectionElements.includes(element)
  }

  //################################
  // TODO: this methods belongs to popovers/link
  //################################

  handleShowPopLinkOver(e) {
    return this.showPopLinkOver()
  }

  handleHidePopLinkOver(e) {
    return this.hidePopLinkOver()
  }

  showPopLinkOver(el) {
    // handles popover display
    // using anchor or from popover

    const parent_el = ReactDOM.findDOMNode(this)

    // set url first in order to calculate popover width
    let coords
    this.refs.anchor_popover.setState({ url: el ? el.href : this.refs.anchor_popover.state.url })

    if (el) {
      coords = this.refs.anchor_popover.relocate(el)
    }

    if (coords) {
      this.refs.anchor_popover.setPosition(coords)
    }

    this.refs.anchor_popover.setState({ show: true })

    this.isHover = true
    return this.cancelHide()
  }

  hidePopLinkOver() {
    return this.hideTimeout = setTimeout(() => {
      return this.refs.anchor_popover.hide()
    }, 300)
  }

  cancelHide() {
    // console.log "Cancel Hide"
    return clearTimeout(this.hideTimeout)
  }

  //##############################

  render() {
    return (
      <div suppressContentEditableWarning={ true }>
        
          <div className="postContent">
            <div ref="richEditor" 
                className="section-inner layoutSingleColumn"
                onClick={ this.focus }>
              <Editor
                blockRendererFn={ this.blockRenderer }
                editorState={ this.state.editorState }
                onChange={ this.onChange }
                handleDrop={this.handleDrop}
                onUpArrow={ this.handleUpArrow }
                onDownArrow={ this.handleDownArrow }
                handleReturn={ this.handleReturn }
                blockRenderMap={ this.state.blockRenderMap }
                blockStyleFn={ this.blockStyleFn }
                customStyleFn={this.customStyleFn }
                handlePastedText={ this.handlePasteText }
                handlePastedFiles={ this.handlePasteImage }
                handleDroppedFiles={ this.handleDroppedFiles }
                handleKeyCommand={ this.handleKeyCommand }
                keyBindingFn={ this.KeyBindingFn }
                handleBeforeInput={ this.handleBeforeInput }
                readOnly={ this.state.read_only }
                placeholder={ this.props.config.body_placeholder }
                ref="editor"
              />
            </div>
          </div>
       
        {
          this.tooltips.map( (o, i) => {
            return (
              <o.component
                ref={ o.ref }
                key={ i }
                editor={ this }
                editorState={ this.state.editorState }
                onChange={ this.onChange }
                styles={this.styles}
                configTooltip={ o }
                widget_options={ o.widget_options }
                showPopLinkOver={ this.showPopLinkOver }
                hidePopLinkOver={ this.hidePopLinkOver }
                handleOnMouseOver={ this.handleShowPopLinkOver }
                handleOnMouseOut={ this.handleHidePopLinkOver }
              />
            )
          })
        }
        {
          this.state.debug
          ? <Debug locks={ this.state.locks } editor={ this } />
          : undefined
        }

        { this.props.config.renderDraggables ? 
            <DraggableElements/> : null
        }
      </div>

    )
  }
}

export default DanteEditor
