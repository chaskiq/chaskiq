import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'
import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField,
        Paper
      } from '@material-ui/core';

import gravatar from '../../shared/gravatar'
import CircularProgress from '@material-ui/core/CircularProgress';


import MainSection from '../../components/MainSection';
import ContentWrapper from '../../components/ContentWrapper';

//import {Link} from 'react-router-dom'

import graphql from '../../graphql/client'
import { withStyles } from '@material-ui/core/styles';

import {
  CompositeDecorator,
  EditorState,
  convertToRaw,
  convertFromRaw,
  createEditorState,
  getVisibleSelectionRect,
  SelectionState
} from 'draft-js'
import MultiDecorator from 'draft-js-multidecorators'

import Dante from "Dante2"
import DanteEditor from 'Dante2/package/es/components/core/editor.js'

import { DanteImagePopoverConfig } from 'Dante2/package/es/components/popovers/image.js'
import { DanteAnchorPopoverConfig } from 'Dante2/package/es/components/popovers/link.js'
import { DanteInlineTooltipConfig } from 'Dante2/package/es/components/popovers/addButton.js' //'Dante2/package/es/components/popovers/addButton.js'
import { DanteTooltipConfig } from 'Dante2/package/es/components/popovers/toolTip.js' //'Dante2/package/es/components/popovers/toolTip.js'
import { ImageBlockConfig } from '../campaigns/article/image.js'
import { EmbedBlockConfig } from 'Dante2/package/es/components/blocks/embed.js'
import { VideoBlockConfig } from 'Dante2/package/es/components/blocks/video.js'
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder.js'
import { VideoRecorderBlockConfig } from 'Dante2/package/es/components/blocks/videoRecorder'
import { CodeBlockConfig } from 'Dante2/package/es/components/blocks/code'
import { DividerBlockConfig } from "Dante2/package/es/components/blocks/divider";
import { ButtonBlockConfig } from "../../editor/components/blocks/button";

import Prism from 'prismjs';
import { PrismDraftDecorator } from 'Dante2/package/es/components/decorators/prism'

import { GiphyBlockConfig } from '../campaigns/article/giphyBlock'
import { SpeechToTextBlockConfig } from '../campaigns/article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'
import Link from 'Dante2/package/es/components/decorators/link'
import findEntities from 'Dante2/package/es/utils/find_entities'

//import Loader from './loader'
import _ from "lodash"


import {ThemeProvider} from 'styled-components'
import EditorContainer from '../../components/conversation/editorStyles'
import theme from '../../components/conversation/theme'


const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
  paper: {
    margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'
  }
});

const defaultProps = {
  content: null,
  read_only: false,
  spellcheck: false,
  title_placeholder: "Title",
  body_placeholder: "Write your story",

  default_wrappers: [
    { className: 'graf--p', block: 'unstyled' },
    { className: 'graf--h2', block: 'header-one' },
    { className: 'graf--h3', block: 'header-two' },
    { className: 'graf--h4', block: 'header-three' },
    { className: 'graf--blockquote', block: 'blockquote' },
    { className: 'graf--insertunorderedlist', block: 'unordered-list-item' },
    { className: 'graf--insertorderedlist', block: 'ordered-list-item' },
    { className: 'graf--code', block: 'code-block' },
    { className: 'graf--bold', block: 'BOLD' },
    { className: 'graf--italic', block: 'ITALIC' },
    { className: 'graf--divider', block: 'divider' }
  ],

  continuousBlocks: [
    "unstyled",
    "blockquote",
    "ordered-list",
    "unordered-list",
    "unordered-list-item",
    "ordered-list-item",
    "code-block"
  ],

  key_commands: {
      "alt-shift": [{ key: 65, cmd: 'add-new-block' }],
      "alt-cmd": [{ key: 49, cmd: 'toggle_block:header-one' },
                  { key: 50, cmd: 'toggle_block:header-two' },
                  { key: 53, cmd: 'toggle_block:blockquote' }],
      "cmd": [{ key: 66, cmd: 'toggle_inline:BOLD' },
              { key: 73, cmd: 'toggle_inline:ITALIC' },
              { key: 75, cmd: 'insert:link' },
              { key: 13, cmd: 'toggle_block:divider' }
      ]
  },

  character_convert_mapping: {
    '> ': "blockquote",
    '*.': "unordered-list-item",
    '* ': "unordered-list-item",
    '- ': "unordered-list-item",
    '1.': "ordered-list-item",
    '# ': 'header-one',
    '##': 'header-two',
    '==': "unstyled",
    '` ': "code-block"
  },

}

class ArticlesNew extends Component {

  state = {};

  emptyContent = () => {
    return { "entityMap": {}, "blocks": [{ "key": "761n6", "text": "Write something", "type": "header-one", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }, { "key": "f1qmb", "text": "", "type": "unstyled", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }, { "key": "efvk7", "text": "Dante2 Inc.\nSantiago, Chile\nYou Received this email because you signed up on our website or made purchase from us.", "type": "footer", "depth": 0, "inlineStyleRanges": [{ "offset": 0, "length": 114, "style": "CUSTOM_FONT_SIZE_13px" }, { "offset": 0, "length": 114, "style": "CUSTOM_COLOR_#8d8181" }], "entityRanges": [], "data": {} }, { "key": "7gh7t", "text": "Unsubscribe", "type": "unsubscribe_button", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": { "enabled": false, "fill": "fill", "displayPopOver": true, "data": {}, "href": "http://mailerlite.com/some_unsubscribe_link_here", "border": "default", "forceUpload": false, "containerStyle": { "textAlign": "left", "margin": "0px 13px 0px 0px" }, "label": "click me", "float": "left", "buttonStyle": { "color": "#fff", "backgroundColor": "#3498db", "padding": "6px 12px", "display": "inline-block", "fontFamily": "Helvetica", "fontSize": 13, "float": "none", "border": "1px solid #3498db" } } }] }
  }

  defaultContent = () => {
    try {
      return JSON.parse(this.props.data.serializedContent) || this.emptyContent()
    } catch (error) {
      return this.emptyContent()
    }
  }

  tooltipsConfig = () => {

    const inlineMenu = {
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
        'jumbo',
        'button'
      ],
    }

    const menuConfig = Object.assign({}, DanteTooltipConfig(), inlineMenu)

    return [
      DanteImagePopoverConfig(),
      DanteAnchorPopoverConfig(),
      DanteInlineTooltipConfig(),
      menuConfig,
      //DanteMarkdownConfig()
    ]
  }

  decorators = (context) => {
    return (context) => {
      return new MultiDecorator([
        PrismDraftDecorator({
          prism: Prism,
          defaultSyntax: 'javascript'
        }),
        new CompositeDecorator(
          [{
            strategy: findEntities.bind(null, 'LINK', context),
            component: Link
          }]
        ),
        //generateDecorator("hello")

      ])
    }
  }

  generateDecorator = (highlightTerm) => {
    const regex = new RegExp(highlightTerm, 'g');
    return new CompositeDecorator([{
      strategy: (contentBlock, callback) => {
        console.info("processing entity!", this.state.incomingSelectionPosition.length)
        if (this.state.incomingSelectionPosition.length > 0) {

          findSelectedBlockFromRemote(
            this.state.incomingSelectionPosition,
            contentBlock,
            callback
          )
        }
        /*if (highlightTerm !== '') {
          findWithRegex(regex, contentBlock, callback);
        }*/
      },
      component: this.searchHighlight,
    }])
  };

  widgetsConfig = () => {
    return [CodeBlockConfig(),
    ImageBlockConfig({
      options: {
        upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
        //upload_handler: this.handleUpload,
        image_caption_placeholder: "type a caption (optional)"
      }
    }),
    DividerBlockConfig(),
    EmbedBlockConfig({
      breakOnContinuous: true,
      editable: true,
      options: {
        placeholder: "put an external links",
        endpoint: `/oembed?url=`
      }
    }),
    VideoBlockConfig({
      breakOnContinuous: true,
      options: {
        placeholder: "put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..",
        endpoint: `/oembed?url=`,
        caption: 'optional caption'
      }
    }),
    PlaceholderBlockConfig(),
    VideoRecorderBlockConfig({
      options: {
        seconds_to_record: 20000,
        upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
      }
    }),
    GiphyBlockConfig(),
    SpeechToTextBlockConfig(),
    ButtonBlockConfig()
    ]
  
  }

  saveHandler = (context, content, cb) => {

    const exportedStyles = context.editor.styleExporter(context.editor.getEditorState())

    let convertOptions = {

      styleToHTML: (style) => {
        if (style === 'BOLD') {
          return <b />;
        }
        if (style === 'ITALIC') {
          return <i />;
        }
        if (style.includes("CUSTOM")) {
          const s = exportedStyles[style].style
          return <span style={s} />
        }
      },
      blockToHTML: (block, oo) => {

        if (block.type === "unstyled") {
          return <p class="graf graf--p" />
        }
        if (block.type === "header-one") {
          return <h1 class="graf graf--h2" />
        }
        if (block.type === "header-two") {
          return <h2 class="graf graf--h3" />
        }
        if (block.type === "header-three") {
          return <h3 class="graf graf--h4" />
        }
        if (block.type === "blockquote") {
          return <blockquote class="graf graf--blockquote" />
        }
        if (block.type === "button" || block.type === "unsubscribe_button") {
          const { href, buttonStyle, containerStyle, label } = block.data
          const containerS = containerStyle ? styleString(containerStyle.toJS ? containerStyle.toJS() : containerStyle) : ''
          const buttonS = containerStyle ? styleString(buttonStyle.toJS ? buttonStyle.toJS() : buttonStyle) : ''
          return {
            start: `<div style="width: 100%; margin: 18px 0px 47px 0px">
                        <div 
                          style="${containerS}">
                          <a href="${href}"
                            className="btn"
                            target="_blank"
                            ref="btn"
                            style="${buttonS}">`,
            end: `</a>
                  </div>
                </div>`}
        }
        if (block.type === "card") {
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
        if (block.type === "jumbo") {
          return {
            start: `<div class="graf graf--jumbo">
                  <div class="jumbotron">
                    <h1>` ,
            end: `</h1>
                  </div>
                </div>`
          }
        }
        if (block.type === "image") {
          const { width, height, ratio } = block.data.aspect_ratio.toJS ? block.data.aspect_ratio.toJS() : block.data.aspect_ratio
          const { url } = block.data
          
          return {
            start: `<figure class="graf graf--figure">
                  <div>
                    <div class="aspectRatioPlaceholder is-locked" style="max-width: 1000px; max-height: ${height}px;">
                      <div class="aspect-ratio-fill" 
                          style="padding-bottom: ${ratio}%;">
                      </div>

                      <img src="${url}" 
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
        if (block.type === "column") {
          return <div class={`graf graf--column ${block.data.className}`} />
        }
        if (block.type === "footer") {

          return {
            start: `<div class="graf graf--figure"><div ><hr/><p>`,
            end: `</p></div></div>`
          }
        }

        if (block.type === "embed") {
          if (!block.data.embed_data)
            return

          let data = null

          // due to a bug in empbed component
          if (typeof (block.data.embed_data.toJS) === "function") {
            data = block.data.embed_data.toJS()
          } else {
            data = block.data.embed_data
          }

          if (data) {
            return <div class="graf graf--mixtapeEmbed">
              <span>
                {
                  data.images[0].url ?
                    <a target="_blank" class="js-mixtapeImage mixtapeImage"
                      href={block.data.provisory_text}
                      style={{ backgroundImage: `url(${data.images[0].url})` }}>
                    </a> : null 
                }
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
          } else {
            <p />
          }
        }

        if (block.type === "video"){
          
          if (!block.data.embed_data)
            return

          let data = null

          // due to a bug in empbed component
          if (typeof (block.data.embed_data.toJS) === "function") {
            data = block.data.embed_data.toJS()
          } else {
            data = block.data.embed_data
          }

          return {
            start: `<figure class="graf--figure graf--iframe graf--first" tabindex="0">
                      <div class="iframeContainer">
                        ${data.html}
                      </div>
                      <figcaption class="imageCaption">
                        <div class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          <span>
                          ${block.data.provisory_text}
                          </span>
                          </span>
                        </div>
                      </figcaption>
                    `,
            end: `</figure>`
          }
        }

        if (block.type === "recorded-video") {

          return (<figure className="graf--figure graf--iframe graf--first" tabindex="0">
                      <div className="iframeContainer">
                        <video 
                          autoplay={false} 
                          style={{width:"100%" }}
                          controls={true} 
                          src={block.data.url}>
                        </video>
                      </div>
                      <figcaption className="imageCaption">
                        <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          {block.text}
                          </span>
                        </div>
                      </figcaption>
                   
            </figure> )
        }
        

        if ("atomic") {
          return <p />
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

    if(this.props.data.serialized_content === serialized)
      return


    this.setState({
      status: "saving...",
      statusButton: "success"
    })

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        html_content: html3,
        serialized_content: serialized
    }}

    /*graphql(UPDATE_CAMPAIGN, params, {
      success: (data)=>{
        this.props.updateData(data.campaignUpdate.campaign, null)
        this.setState({ status: "saved" })
      }, 
      error: ()=>{

      }
    })*/

    if (cb)
      cb(html3, plain, serialized)
  }

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json)
    return EditorState.createWithContent(new_content)
  }


  render() {
    const {classes} = this.props
    return (
       <React.Fragment>

       <Paper 
         square={true}
         elevation={1}
         className={classes.paper}>

         <ThemeProvider theme={theme}>
          <DanteEditor
                          {...defaultProps}
                          debug={false}
                          data_storage={
                            {
                              url: "/",
                              save_handler: this.saveHandler
                            }
                          }
                          onChange={(e) => {
                            this.dante_editor = e
                            const newContent = convertToRaw(e.state.editorState.getCurrentContent()) //e.state.editorState.getCurrentContent().toJS()
                            this.menuResizeFunc = getVisibleSelectionRect
                            const selectionState = e.state.editorState.getSelection();

                            /*if(window.getSelection().rangeCount > 0){
                              window.getSelection().getRangeAt(0)
                              debugger
                            }*/
                            //console.log("MENU POSITION", this.menuResizeFunc(window))
                            this.setState({
                              currentContent: newContent,
                              selectionPosition: selectionState.toJSON() //this.menuResizeFunc(window),
                            })

                            //console.log("cha chachanges: ", e.state.editorState)
                          }}
                          content={this.defaultContent()}
                          tooltips={this.tooltipsConfig()}
                          widgets={this.widgetsConfig()}
                          decorators={(context) => {
                            return new MultiDecorator([
                              //this.generateDecorator("hello"),
                              PrismDraftDecorator({ prism: Prism }),
                              new CompositeDecorator(
                                [{
                                  strategy: findEntities.bind(null, 'LINK', context),
                                  component: Link
                                }]
                              )

                            ])
                          }
                          }
          />
         </ThemeProvider>

       </Paper>

        
      </React.Fragment>
    );
  }
}


function mapStateToProps(state) {

  const { auth, app } = state
  const { isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated
  }
}


export default withRouter(connect(mapStateToProps)(withStyles(styles)(ArticlesNew)))
