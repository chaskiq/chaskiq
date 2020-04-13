
//import material from 'material-design-lite/material.min.css'
//import material.min.js
import React from 'react';
import ReactDOM from 'react-dom';

import {convertToHTML} from 'draft-convert'
import DanteEditor from "./components/editor.js"
import dantecss from './styles/dante.scss';
import mailerlitecss from './styles/mailerlite.scss';
import MailerLite from './demo.js'

import { Map, fromJS } from 'immutable'
import DanteImagePopover from './components/popovers/image.js'
import DanteAnchorPopover from './components/popovers/link.js'
import DanteInlineTooltip from './components/popovers/addButton.js' //'Dante2/es/components/popovers/addButton.js'
import DanteTooltip from './components/popovers/toolTip.js' //'Dante2/es/components/popovers/toolTip.js'
import ImageBlock from './components/blocks/image.js'
import EmbedBlock from './components/blocks/embed.js'
import VideoBlock from './components/blocks/video.js'
import PlaceholderBlock from './components/blocks/placeholder.js'
import Icons from "./components/icons.js"

// custom blocks

import DividerBlock from './components/blocks/divider'
import ButtonBlock from './components/blocks/button'
import CardBlock from './components/blocks/card'
import UnsubscribeBlock from './components/blocks/unsubscribe'

// design blocks

import Column from './components/blocks/column.js'
import Jumbo from './components/blocks/jumbo.js'

//

import {
  resetBlockWithType,
  addNewBlockAt
} from './model/index.js'

// component implementation
class DemoApp extends React.Component {

  constructor(props) {
    super(props)
    let config = Map(fromJS(this.defaultOptions(props.config)))
    this.options = config.mergeDeep(props.config).toJS()
  }

  defaultOptions(options) {
    // default options
    if (options == null) {
      options = {}
    }
    let defaultOptions = {}
    defaultOptions.el = 'app'
    defaultOptions.content = ""
    defaultOptions.read_only = false
    defaultOptions.spellcheck = false
    defaultOptions.title_placeholder = "Title"
    defaultOptions.body_placeholder = "Write your story"
    // @defaultOptions.api_key = "86c28a410a104c8bb58848733c82f840"

    defaultOptions.widgets = [
      {
        icon: 'jumbo',
        type: 'jumbo',
        title: "Jumbo",
        breakOnContinuous: true,
        editable: true,
        renderable: true,
        undeletable: true,
        block: Jumbo,
        wrapper_class: "graf graf--jumbo",
        widget_options: {
          displayOnInlineTooltip: false
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        }    
      },
      {
        icon: 'column',
        type: 'column',
        title: "Column",
        breakOnContinuous: true,
        editable: true,
        renderable: true,
        undeletable: true,
        block: Column,
        wrapper_class: "graf graf--column",

        selectedFn: block => {
          const { className } = block.getData().toJS()
          return className
        },

        widget_options: {
          displayOnInlineTooltip: false
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        }    
      },
      {
          icon: 'footer',
          type: 'footer',
          title: "Footer",
          breakOnContinuous: true,
          editable: true,
          renderable: true,
          undeletable: true,
          block: UnsubscribeBlock,
          wrapper_class: "graf graf--figure",
          widget_options: {
            displayOnInlineTooltip: false,
            insertion: "insertion",
            insert_block: "unsubscribe"
          },
          handleEnterWithoutText(ctx, block) {
            const { editorState } = ctx.state
            return true
            //ctx.onChange(addNewBlockAt(editorState, block.getKey()))
          },
          handleEnterWithText(ctx, block) {
            const { editorState } = ctx.state
            return true
            //return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
          }
      },
      {
        icon: 'card',
        type: 'card',
        title: 'Signature',
        breakOnContinuous: true,
        editable: true,
        renderable: true,
        block: CardBlock,
        wrapper_class: 'graf graf--figure',
        widget_options: {
          displayOnInlineTooltip: true,
          insertion: 'insertion',
          insert_block: 'card'
        },
        options: {
          upload_url: options.upload_url,
          upload_headers: options.upload_headers,
          upload_formName: options.upload_formName,
          upload_callback: options.image_upload_callback,
          image_delete_callback: options.image_delete_callback,
          image_caption_placeholder: options.image_caption_placeholder
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        }
      },
      {
        icon: 'divider',
        type: 'divider',
        title: "Divider",
        editable: false,
        renderable: true,
        breakOnContinuous: true,
        block: DividerBlock,
        widget_options: {
          displayOnInlineTooltip: true,
          insertion: "insertion",
          insert_block: "divider"
        }
      },
      {
        icon: 'button',
        type: 'button',
        title: "Button",
        breakOnContinuous: true,
        editable: true,
        renderable: true,
        block: ButtonBlock,
        wrapper_class: "graf graf--figure",
        widget_options: {
          displayOnInlineTooltip: true,
          insertion: "insertion",
          insert_block: "button"
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
      },
      {
        icon: 'button',
        type: 'unsubscribe_button',
        title: "Button",
        breakOnContinuous: true,
        editable: true,
        renderable: true,
        undeletable: true,
        block: ButtonBlock,
        wrapper_class: "graf graf--figure",
        widget_options: {
          displayOnInlineTooltip: false,
          insertion: "insertion",
          insert_block: "button"
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return true
          //return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return true
          //return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
      },
      {
        title: 'add an image',
        icon: 'image',
        type: 'image',
        block: ImageBlock,
        editable: true,
        renderable: true,
        breakOnContinuous: true,
        wrapper_class: "graf graf--figure",
        selected_class: "is-selected is-mediaFocused",
        selectedFn: block => {
          const { direction } = block.getData().toJS()
          switch (direction) {
            case "left":
              return "graf--layoutOutsetLeft"
            case "center":
              return ""
            case "wide":
              return "sectionLayout--fullWidth"
            case "fill":
              return "graf--layoutFillWidth"
          }
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        widget_options: {
          displayOnInlineTooltip: true,
          insertion: "upload",
          insert_block: "image"
        },
        options: {
          upload_url: options.upload_url,
          upload_headers: options.upload_headers,
          upload_formName: options.upload_formName,
          upload_callback: options.image_upload_callback,
          image_delete_callback: options.image_delete_callback,
          image_caption_placeholder: options.image_caption_placeholder
        }
      }, {
        icon: 'embed',
        title: 'insert embed',
        type: 'embed',
        block: EmbedBlock,
        editable: true,
        renderable: true,
        breakOnContinuous: true,
        wrapper_class: "graf graf--mixtapeEmbed",
        selected_class: "is-selected is-mediaFocused",
        widget_options: {
          displayOnInlineTooltip: true,
          insertion: "placeholder",
          insert_block: "embed"
        },
        options: {
          endpoint: `${options.oembed_uri}`,
          placeholder: 'Paste a link to embed content from another site (e.g. Twitter) and press Enter'
        },
        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },
        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        }
      }, {
        icon: 'video',
        title: 'insert video',
        editable: true,
        type: 'video',
        block: VideoBlock,
        renderable: true,
        breakOnContinuous: true,
        wrapper_class: "graf--figure graf--iframe",
        selected_class: " is-selected is-mediaFocused",
        widget_options: {
          displayOnInlineTooltip: true,
          insertion: "placeholder",
          insert_block: "video"
        },
        options: {
          endpoint: `${options.oembed_uri}`,
          placeholder: 'Paste a YouTube, Vine, Vimeo, or other video link, and press Enter',
          caption: 'Type caption for embed (optional)'
        },

        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        },

        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
        }
      }, {
        renderable: true,
        editable: true,
        block: PlaceholderBlock,
        type: 'placeholder',
        wrapper_class: "is-embedable",
        breakOnContinuous: true,
        selected_class: "is-selected is-mediaFocused",
        widget_options: {
          displayOnInlineTooltip: false
        },

        handleEnterWithoutText(ctx, block) {
          const { editorState } = ctx.state
          return ctx.onChange(resetBlockWithType(editorState, "unstyled"))
        },

        handleEnterWithText(ctx, block) {
          const { editorState } = ctx.state
          const data = {
            provisory_text: block.getText(),
            endpoint: block.getData().get('endpoint'),
            type: block.getData().get('type')
          }
          return ctx.onChange(resetBlockWithType(editorState, data.type, data))
        }
      }
    ]

    defaultOptions.tooltips = [
    {
      ref: 'insert_tooltip',
      component: DanteTooltip,
      displayOnSelection: true,
      selectionElements: [
      "unstyled",
      "blockquote",
      "ordered-list",
      "unordered-list",
      "unordered-list-item",
      "ordered-list-item",
      "code-block",
      'header-one',
      'header-two',
      'header-three',
      'header-four',
      'footer', 
      'column',
      'jumbo'],
      widget_options: {
        placeholder: "type a url",
        
        block_types: [
        { label: 'p', style: 'unstyled',  icon: Icons.bold },
        { label: 'h2', style: 'header-one', type: "block" , icon: Icons.h1 },
        { label: 'h3', style: 'header-two', type: "block",  icon: Icons.h2 },
        { label: 'h4', style: 'header-three', type: "block",  icon: Icons.h3 },

        { type: "separator" },
        { label: 'color', type: "color" },
        { type: "link" },
      
        { label: 'blockquote', style: 'blockquote', type: "block", icon: Icons.blockquote },
        { type: "separator" },
        { label: 'insertunorderedlist', style: 'unordered-list-item', type: "block", icon: Icons.insertunorderedlist },
        { label: 'insertorderedlist', style: 'ordered-list-item', type: "block", icon: Icons.insertunorderedlist },
        { type: "separator" },
        { label: 'code', style: 'code-block', type: "block",  icon: Icons.code },
        { label: 'bold', style: 'BOLD', type: "inline", icon: Icons.bold },
        { label: 'italic', style: 'ITALIC', type: "inline", icon: Icons.italic }]
      }
    }, {
      ref: 'add_tooltip',
      component: DanteInlineTooltip
    }, {
      ref: 'anchor_popover',
      component: DanteAnchorPopover
    }, {
      ref: 'image_popover',
      component: DanteImagePopover
    }]

    defaultOptions.xhr = {
      before_handler: null,
      success_handler: null,
      error_handler: null
    }

    defaultOptions.data_storage = {
      url: null,
      method: "POST",
      success_handler: null,
      failure_handler: null,
      interval: 1500
    }

    defaultOptions.default_wrappers = [
      { className: 'graf--p', block: 'unstyled' },
      { className: 'graf--h2', block: 'header-one' },
      { className: 'graf--h3', block: 'header-two' },
      { className: 'graf--h4', block: 'header-three' },
      { className: 'graf--blockquote', block: 'blockquote' },
      { className: 'graf--insertunorderedlist', block: 'unordered-list-item' },
      { className: 'graf--insertorderedlist', block: 'ordered-list-item' },
      { className: 'graf--code', block: 'code-block' },
      { className: 'graf--bold', block: 'BOLD' },
      { className: 'graf--italic', block: 'ITALIC' }]

      defaultOptions.continuousBlocks = [
      "unstyled",
      "blockquote",
      "ordered-list",
      "unordered-list",
      "unordered-list-item",
      "ordered-list-item",
      "code-block"
    ]

    defaultOptions.key_commands = {
      "alt-shift": [{ key: 65, cmd: 'add-new-block' }],
      "alt-cmd": [{ key: 49, cmd: 'toggle_block:header-one' },
                  { key: 50, cmd: 'toggle_block:header-two' },
                  { key: 53, cmd: 'toggle_block:blockquote' }],
      "cmd": [{ key: 66, cmd: 'toggle_inline:BOLD' },
              { key: 73, cmd: 'toggle_inline:ITALIC' },
              { key: 75, cmd: 'insert:link' }]
    }

    defaultOptions.character_convert_mapping = {
      '> ': "blockquote",
      '*.': "unordered-list-item",
      '* ': "unordered-list-item",
      '- ': "unordered-list-item",
      '1.': "ordered-list-item",
      '# ': 'header-one',
      '##': 'header-two',
      '==': "unstyled",
      '` ': "code-block"
    }

    return defaultOptions
  }

  componentDidMount() {

    //  // simple implementation, use the js class
    //
    //  var article = new Dante({
    //    el: "app",
    //    content: demo,
    //    read_only: true,
    //    debug: true
    //  })
    //  article.render()

  }

  render(){
    return(
      <div>
        <DanteEditor
          content={this.props.content}
          config={ this.options }
        />
      </div>
    )
  }
}

export default DemoApp;