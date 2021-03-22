import React from 'react'
import ReactDOM from 'react-dom'

import {
  addNewBlock,
  resetBlockWithType,
  getCurrentBlock
} from 'Dante2/package/es/model/index.js'

import {
  getSelectionRect,
  getSelection,

  getRelativeParent
} from 'Dante2/package/es/utils/selection.js'

import { InlinetooltipWrapper } from './tooltipMenuStyle'

export default class DanteInlineTooltip extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      position: { top: 0, left: 0 },
      show: false,
      scaled: false,
      scaledWidth: '0px'
    }
    this.initialPosition = 0
    this.tooltip  = null
    this.fileInput = null
  }

  componentDidMount () {
    // this.initialPosition = this.refs.tooltip.offsetLeft
  }

  display = (b) => {
    if (b) {
      return this.show()
    } else {
      return this.hide()
    }
  };

  show = () => {
    return this.setState({
      show: true
    })
  };

  hide = () => {
    return this.setState({
      show: false
    })
  };

  setPosition = (coords) => {
    return this.setState({
      position: coords
    })
  };

  _toggleScaled = (ev) => {
    ev.preventDefault()
    if (this.state.scaled) {
      return this.collapse()
    } else {
      return this.scale()
    }
  };

  scale = () => {
    if (this.state.scaled) {
      return
    }
    return this.setState(
      {
        scaled: true
      },
      () => {
        this.setState({ scaledWidth: '300px' })
      }
    )
  };

  collapse = () => {
    if (!this.state.scaled) {
      return
    }
    return this.setState(
      {
        scaled: false
      },
      () => {
        setTimeout(() => {
          this.setState({ scaledWidth: '0px' })
        }, 300)
      }
    )
  };

  UNSAFE_componentWillReceiveProps (_newProps) {
    return this.collapse()
  }

  activeClass = () => {
    // if @props.show then "is-active" else ""
    if (this.isActive()) {
      return 'is-active'
    } else {
      return ''
    }
  };

  isActive = () => {
    return this.state.show
  };

  scaledClass = () => {
    // if (this.state.scaled) {
    return 'is-scaled'
    // } else {
    //  return ""
    // }
  };

  // expand , 1, widht 2. class
  // collapse , class, width

  clickOnFileUpload = () => {
    this.fileInput.click()
    this.collapse()
    return this.hide()
  };

  handlePlaceholder = (input) => {
    const opts = {
      type: input.widget_options.insert_block,
      placeholder: input.options.placeholder,
      endpoint: input.options.endpoint
    }

    return this.props.onChange(
      resetBlockWithType(this.props.editorState, 'placeholder', opts)
    )
  };

  insertImage = (file) => {
    const opts = {
      url: URL.createObjectURL(file),
      file
    }

    return this.props.onChange(
      addNewBlock(this.props.editorState, 'image', opts)
    )
  };

  insertFile = (file) => {
    const opts = {
      url: URL.createObjectURL(file),
      file
    }

    return this.props.onChange(
      addNewBlock(this.props.editorState, 'file', opts)
    )
  };

  handleFileInput = (e) => {
    const fileList = e.target.files
    const file = fileList[0]
    // TODO: support multiple file uploads
    /*
    Object.keys(fileList).forEach (o)=>
      @.insertImage(fileList[0])
    */
    if (file.type.match('image/')) return this.insertImage(file)
    return this.insertFile(file)
  };

  handleInsertion = (e) => {
    this.hide()
    return this.props.onChange(addNewBlock(this.props.editorState, e.type, {}))
  };

  handleFunc = (e) => {
    this.hide()
    console.log(e.widget_options)
    return e.widget_options.funcHandler(this)
  };

  widgets = () => {
    return this.props.editor.props.widgets
  };

  clickHandler = (e, type) => {
    const request_block = this.widgets().find((o) => o.type === type)
    switch (request_block.widget_options.insertion) {
      case 'upload':
        return this.clickOnFileUpload(e, request_block)
      case 'placeholder':
        return this.handlePlaceholder(request_block)
      case 'insertion':
        return this.handleInsertion(request_block)
      case 'func':
        return this.handleFunc(request_block)
      default:
        return console.log(
          `WRONG TYPE FOR ${request_block.widget_options.insertion}`
        )
    }
  };

  getItems = () => {
    return this.widgets().filter((o) => {
      return o.widget_options ? o.widget_options.displayOnInlineTooltip : null
    })
  };

  isDescendant = (parent, child) => {
    let node = child.parentNode
    while (node !== null) {
      if (node === parent) {
        return true
      }
      node = node.parentNode
    }
    return false
  };

  relocate = () => {
    const { editorState } = this.props
    const currentBlock = getCurrentBlock(this.props.editorState)
    const blockType = currentBlock.getType()
    const block = currentBlock

    if (!editorState.getSelection().isCollapsed()) {
      return
    }

    // display tooltip only for unstyled

    const nativeSelection = getSelection(window)
    if (!nativeSelection.rangeCount) {
      return
    }

    const selectionRect = getSelectionRect(nativeSelection)

    // eslint-disable-next-line react/no-find-dom-node
    const parent = ReactDOM.findDOMNode(this.props.editor)

    // hide if selected node is not in editor
    if (!this.isDescendant(parent, nativeSelection.anchorNode)) {
      this.hide()
      return
    }

    const relativeParent = getRelativeParent(this.tooltip.parentElement)
    const toolbarHeight = this.tooltip.clientHeight
    const toolbarWidth = this.tooltip.clientWidth
    const relativeRect = (
      relativeParent || document.body
    ).getBoundingClientRect()

    if (!relativeRect || !selectionRect) return

    const top = selectionRect.top - relativeRect.top - toolbarHeight / 5
    const left =
      selectionRect.left -
      relativeRect.left +
      selectionRect.width / 2 -
      toolbarWidth * 1.3

    if (!top || !left) {
      return
    }

    this.display(block.getText().length === 0 && blockType === 'unstyled')

    this.setPosition({
      top: top, // + window.scrollY - 5,
      left: left
      // show: block.getText().length === 0 && blockType === "unstyled"
    })
  };

  render () {
    return (
      <InlinetooltipWrapper
        ref={(comp)=>this.tooltip = comp }
        className={`inlineTooltip ${this.activeClass()} ${this.scaledClass()}`}
        style={this.state.position}
      >
        {/* <button
            type="button"
            className="inlineTooltip-button control"
            title="Close Menu"
            data-action="inline-menu"
            onClick={ this._toggleScaled }
          >
            {add()}
          </button>
        */}

        <div className="inlineTooltip-menu">
          {this.getItems().map((item, i) => {
            return (
              <InlineTooltipItem
                item={item}
                key={i}
                clickHandler={this.clickHandler}
              />
            )
          })}
          <input
            type="file"
            // accept="image/*"
            style={{ display: 'none' }}
            ref={(comp)=> this.fileInput = comp }
            // multiple="multiple"
            onChange={this.handleFileInput}
          />
        </div>
      </InlinetooltipWrapper>
    )
  }
}

class InlineTooltipItem extends React.Component {
  clickHandler = (e) => {
    e.preventDefault()
    return this.props.clickHandler(e, this.props.item.type)
  };

  render () {
    return (
      <button
        type="button"
        className="inlineTooltip-button scale"
        title={this.props.title}
        onMouseDown={this.clickHandler}
        onClick={(e) => e.preventDefault()}
        style={{ fontSize: '21px' }}
      >
        {<span className={'tooltip-icon'}>{this.props.item.icon()}</span>}
      </button>
    )
  }
}

export const DanteInlineTooltipConfig = (options = {}) => {
  const config = {
    ref: 'add_tooltip',
    component: DanteInlineTooltip
  }
  return Object.assign(config, options)
}
