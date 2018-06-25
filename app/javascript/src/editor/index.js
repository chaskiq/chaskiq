
//import material from 'material-design-lite/material.min.css'
//import material.min.js
import React from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash"

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
        selected_class: " is-selected is-mediaFocused",
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
         {label: 'p', style: 'unstyled'},
          //{ label: 'h2', style: 'header-one', type: "block" },
          //{ label: 'h3', style: 'header-two', type: "block" },
          //{ label: 'h4', style: 'header-three', type: "block" },
          //{ label: 'blockquote', style: 'blockquote', type: "block" },
        { label: 'insertunorderedlist', style: 'unordered-list-item', type: "block" },
        { label: 'insertorderedlist', style: 'ordered-list-item', type: "block" },
        //{ label: 'code', style: 'code-block', type: "block" },
        { label: 'bold', style: 'BOLD', type: "inline" },
        { label: 'italic', style: 'ITALIC', type: "inline" }]
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


const styleString = (obj)=>{
  return Object.keys(obj).map((o)=> { 
    return `${_.snakeCase(o).replace("_", "-")}: ${obj[o]} `
  }).join("; ")
}

const blockWithLineBreak = (block) =>{
  return block.getText().split('\n').join("<br/>")
}

const save_handler = function(context, content){
  
  const exportedStyles = context.editor.styleExporter(context.editor.getEditorState())

  let convertOptions = {

    styleToHTML: (style) => {
      if (style === 'BOLD') {
        return <b/>;
      }
      if (style === 'ITALIC') {
        return <i/>;
      }
      if (style.includes("CUSTOM")){
        const s = exportedStyles[style].style
        return <span style={s} />
      }
    },
    blockToHTML: (block, oo) => {
     
      if (block.type === "unstyled"){
        return <p class="graf graf--p"/>
      }
      if (block.type === "header-one"){
        return <h1 class="graf graf--h2"/>
      }
      if (block.type === "header-two"){
        return <h2 class="graf graf--h3"/>
      }
      if (block.type === "header-three"){
        return <h3 class="graf graf--h4"/>
      }
      if (block.type === "button" || block.type === "unsubscribe_button"){
        const {href, buttonStyle, containerStyle, label} = block.data
        return {start: `<div style="width: 100%; margin: 18px 0px 47px 0px">
                        <div 
                          style="${styleString(containerStyle)}">
                          <a href="${href}"
                            className="btn"
                            ref="btn"
                            style="${styleString(buttonStyle)}">`,
                end: `</a>
                  </div>
                </div>`}
      }
      if (block.type === "card"){
        return {
          start: `<div class="graf graf--figure">
                  <div style="width: 100%; height: 100px; margin: 18px 0px 47px">
                    <div class="signature">
                      <div>
                        <a href="#" contenteditable="false">
                          <img src="${block.data.image}">
                          <div></div>
                        </a>
                      </div>
                      <div class="text" 
                        style="color: rgb(153, 153, 153);
                              font-size: 12px; 
                              font-weight: bold">`,
                end: `</div>
                    </div>
                  <div class="dante-clearfix"/>
                </div>
              </div>`
        }
      }
      if (block.type === "jumbo"){
        return {
          start: `<div class="graf graf--jumbo">
                  <div class="jumbotron">
                    <h1>` ,
          end: `</h1>
                  </div>
                </div>`
        }
      }
      if (block.type === "image"){
        const {width, height, ratio} = block.data.aspect_ratio
        const {url } = block.data
        return {
          start: `<figure class="graf graf--figure">
                  <div>
                    <div class="aspectRatioPlaceholder is-locked" style="max-width: 1000px; max-height: 723.558px;">
                      <div class="aspect-ratio-fill" 
                          style="padding-bottom: ${ratio}%;">
                      </div>

                      <img src="${url}" 
                        height=${height} 
                        width=${width} 
                        class="graf-image" 
                        contenteditable="false"
                      >
                    <div>
                  </div>

                  </div>
                  <figcaption class="imageCaption">
                    <span>
                      <span data-text="true">`,
          end: `</span>
                    </span>
                  </figcaption>
                  </div>
                </figure>`
        }
      }
      if (block.type === "column"){
        return <div class={`graf graf--column ${block.data.className}`}/>
      }
      if (block.type === "footer"){
        
        return {
                start:`<div class="graf graf--figure"><div ><hr/><p>`,
                end: `</p></div></div>`
              }
      }

      if(block.type === "embed"){
        if(!block.data.embed_data)
          return

        let data = null

        // due to a bug in empbed component
        if(typeof(block.data.embed_data.toJS) === "function"){
          data = block.data.embed_data.toJS()  
        } else {
          data = block.data.embed_data
        }
        
        if( data ){
          return <div class="graf graf--mixtapeEmbed">
                  <span>
                    <a target="_blank" class="js-mixtapeImage mixtapeImage" 
                      href={block.data.provisory_text} 
                      style={{backgroundImage: `url(${data.images[0].url})` }}>
                    </a>
                    <a class="markup--anchor markup--mixtapeEmbed-anchor" 
                      target="_blank" 
                      href={block.data.provisory_text}>
                      <strong class="markup--strong markup--mixtapeEmbed-strong">
                        {data.title}
                      </strong>
                      <em class="markup--em markup--mixtapeEmbed-em">
                        {data.description}
                      </em>
                    </a>
                    {data.provider_url}
                  </span>
                </div>
        } else{
          <p/>
        }
      }
      if ("atomic"){
        return <p/>
      }

      if (block.type === 'PARAGRAPH') {
        return <p />;
      }
    },
    entityToHTML: (entity, originalText) => {
      if (entity.type === 'LINK') {
        return <a href={entity.data.url}>{originalText}</a>;
      }
      return originalText;
    }
  }

  let html3 = convertToHTML(convertOptions)(context.editorState().getCurrentContent())
 
  const serialized = JSON.stringify(content)
  const plain = context.getTextFromEditor(content)

  console.log(html3)
  //document.getElementById("editor-container").innerHTML = html3
  if(window.parent.window.save_handler)
    window.parent.window.save_handler(html3, plain, serialized)
}

/*
ReactDOM.render(
  <DemoApp
    content={MailerLite}
    config={
      {
        api_key: "86c28a410a104c8bb58848733c82f840",
        debug: true,
        read_only: false,
        oembed_uri: "http://localhost:3000/oembed?url=",
        upload_url: "http://localhost:9292/uploads/new",
        renderDraggables: false,
        data_storage: {
          save_handler: save_handler,
          url: "window.parent.window.save_url",
          method: "put"
        }
      }
    }
  />,
  document.getElementById("root")
)
registerServiceWorker();
*/

export default DemoApp;

/*
ReactDOM.render(
  <DemoApp
    content={window.parent.window.data}
    config={
      {
        api_key: "86c28a410a104c8bb58848733c82f840",
        debug: window.parent.window.debug,
        oembed_uri: window.parent.oembed_url,
        read_only: window.parent.window.read_only,
        upload_url: window.parent.window.attachment_pach,
        renderDraggables: window.parent.window.renderDraggables,
        data_storage: {
          save_handler: save_handler,
          url: window.parent.window.save_url,
          method: window.parent.window.store_method,
          success_handler: window.parent.window.successStoreHandler,
        }
      }
    }
  />,
  document.getElementById("root")
)*/


