import React, { Component } from 'react'
import {
  isEmpty
} from 'lodash';

import { convertToHTML } from 'draft-convert'
import axios from 'axios'
//import Lozenge from '@atlaskit/lozenge';
//import Button from '@atlaskit/button';
import graphql from '../../graphql/client'
import { UPDATE_CAMPAIGN, DELIVER_CAMPAIGN} from '../../graphql/mutations'

//import config from "../constants/config"

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
import { ImageBlockConfig } from './article/image.js'
import { EmbedBlockConfig } from 'Dante2/package/es/components/blocks/embed.js'
import { VideoBlockConfig } from 'Dante2/package/es/components/blocks/video.js'
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder.js'
import { VideoRecorderBlockConfig } from 'Dante2/package/es/components/blocks/videoRecorder'
import { CodeBlockConfig } from 'Dante2/package/es/components/blocks/code'
import { DividerBlockConfig } from "Dante2/package/es/components/blocks/divider";
import { ButtonBlockConfig } from "../../editor/components/blocks/button";

import Prism from 'prismjs';
import { PrismDraftDecorator } from 'Dante2/package/es/components/decorators/prism'

import { GiphyBlockConfig } from './article/giphyBlock'
import { SpeechToTextBlockConfig } from './article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'

import Link from 'Dante2/package/es/components/decorators/link'
import findEntities from 'Dante2/package/es/utils/find_entities'

import Loader from './loader'
import _ from "lodash"


import {ThemeProvider} from 'emotion-theming'
import EditorContainer from '../../components/conversation/editorStyles'
import theme from '../../components/conversation/theme'



//import jsondiff from "json0-ot-diff"
//import ot from 'ot-json0'

//import RtcView from './rtc'
import styled from '@emotion/styled'

const styleString = (obj) => {
  if(!obj)
    return ""
  return Object.keys(obj).map((o) => {
    return `${_.snakeCase(o).replace("_", "-")}: ${obj[o]} `
  }).join("; ")
}

const config = {
  endpoint: ""
}

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



const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start, end;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    end = start + matchArr[0].length;
    callback(start, end);
  }
};

const findSelectedBlockFromRemote = (selectionRange, contentBlock, callback) => {
  const text = contentBlock.getText();
  const k = contentBlock.getKey();
  let sel, start, end;

  sel = selectionRange.find((o) => o.anchorKey === k)
  console.log("selection: ", selectionRange, k)
  if (sel) {
    start = sel.anchorOffset
    end = start === sel.focusOffset ? sel.focusOffset + 1 : sel.focusOffset
    console.log("entity at", start, end)
    callback(start, end)
  }

};

export const SelectionIndicator = styled.span`
  position: relative;
  background-color: red;
  }
`
const UserIndicator = styled.div`
  padding: 2px;
  position: absolute;
  bottom: -28px;
  right: 0px;
  display: inline-block;
  background: #00000094;
  color: white;
  border-radius: 3px;
  padding-left: 6px;
  padding-right: 6px;
  border: 1px solid #000;
  z-index: 2;
  font-size: 0.7rem;
  i.arrow{
    &:after{
     content: &#9658;
    }
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  float: right;
  margin: 4px 4px;
`

const ButtonsRow = styled.div`
  align-self: flex-end;
  clear: both;
  margin: 0px;
  button{
    margin-right: 2px;
  }
`

const BrowserSimulator = styled.div`
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212,9%,64%,.16), 0 1px 2px 0 rgba(39,45,52,.08);
  box-shadow: 0 4px 8px 0 hsla(212,9%,64%,.16), 0 1px 2px 0 rgba(39,45,52,.08);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
`
const BrowserSimulatorHeader = styled.div`
  background: rgb(199,199,199);
  background: linear-gradient(0deg, rgba(199,199,199,1) 0%, rgba(223,223,223,1) 55%, rgba(233,233,233,1) 100%);
  border-bottom: 1px solid #b1b0b0;
  padding: 10px;
  display:flex;
`
const BrowserSimulatorButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 43px;

  .r{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fc635e;
    border: 1px solid #dc4441;
  }
  .y{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fdbc40;
    border: 1px solid #db9c31;
  }
  .g{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #35cd4b;
    border: 1px solid #24a732;
  }
`

const EditorPad = styled.div`


  ${props => props.mode === "user_auto_messages" ? 
    ` display:flex;
      justify-content: flex-end;
      flex-flow: column;
      height: 90vh;

      .postContent {
        height: 440px;
        overflow: auto;
      }
    ` : 

    `
      padding: 2em;
      background-color: white;
      margin: 8em;
      margin-top: 23px;
      border: 1px solid #ececec;
    `
  } 
`

const EditorContentWrapper = styled.div`

`

const EditorMessengerEmulator = styled.div`
  ${props => props.mode === "user_auto_messages" ? `
  display:flex;
  justify-content: flex-end;`: ``}
`

const EditorMessengerEmulatorWrapper = styled.div`

  ${props => props.mode === "user_auto_messages" ? 
    `width: 380px;
    background: #fff;
    border: 1px solid #f3efef;
    margin-bottom: 25px;
    margin-right: 20px;
    box-shadow: 3px 3px 4px 0px #b5b4b4;
    border-radius: 10px;
    padding: 12px;
    padding-top: 0px;
    .icon-add{
      margin-top: -2px;
      margin-left: -2px;
    }
    `: ``}

`

const EditorMessengerEmulatorHeader = styled.div`
  ${props => props.mode === "user_auto_messages" ? `
  padding: 1em;
  border-bottom: 1px solid #ccc;
  ` :``}
`



export default class CampaignEditor extends Component {

  constructor(props) {
    super(props)

    this.dante_editor = null
    this.ChannelEvents = null
    this.conn = null
    this.menuResizeFunc = null
    this.state = {
      loading: true,
      currentContent: null,
      diff: "",
      videoSession: false,
      selectionPosition: null,
      incomingSelectionPosition: [],
      data: {},
      status: "",
      statusButton: "inprogress"
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

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

  searchHighlight = (props) => {
    const sel = this.state.incomingSelectionPosition.find((o) => o.anchorKey === props.children[0].props.block.getKey())

    return <SelectionIndicator style={{ background: "yellow" }}>
      <UserIndicator>
        {sel.user}
        <i className="arrow"></i>
      </UserIndicator>
      {props.children}
    </SelectionIndicator>
  }

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
          return <p className="graf graf--p" />
        }
        if (block.type === "header-one") {
          return <h1 className="graf graf--h2" />
        }
        if (block.type === "header-two") {
          return <h2 className="graf graf--h3" />
        }
        if (block.type === "header-three") {
          return <h3 className="graf graf--h4" />
        }
        if (block.type === "blockquote") {
          return <blockquote className="graf graf--blockquote" />
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
          return <div className={`graf graf--column ${block.data.className}`} />
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
            return <div className="graf graf--mixtapeEmbed">
              <span>
                {
                  data.images[0].url ?
                    <a target="_blank" className="js-mixtapeImage mixtapeImage"
                      href={block.data.provisory_text}
                      style={{ backgroundImage: `url(${data.images[0].url})` }}>
                    </a> : null 
                }
                <a className="markup--anchor markup--mixtapeEmbed-anchor"
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

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data)=>{
        this.props.updateData(data.campaignUpdate.campaign, null)
        this.setState({ status: "saved" })
      }, 
      error: ()=>{

      }
    })

    /*axios.put(`${this.props.url}.json?mode=${this.props.mode}`, {
      campaign: {
        html_content: html3,
        serialized_content: serialized
      }
    })
      .then((response) => {
        console.log(response)
        
        this.props.updateData(response.data, null)
        this.setState({ status: "saved" })
      }).catch((err) => {
        console.log(err)
      })
    */

    if (cb)
      cb(html3, plain, serialized)
  }

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json)
    return EditorState.createWithContent(new_content)
  }


  renderSelection = (position) => {
    //const positionObject = position //this.state.selectionPosition

    const pos = Object.assign({},
      position,
      {
        width: position.width === 0 ? 2 : position.width,
        top: position.top + window.pageYOffset
      })
    console.log("post mada: ", pos)
    return <SelectionIndicator style={pos}>
      <span>
        {this.props.currentUser.email}
        <i className="arrow"></i>
      </span>
    </SelectionIndicator>
  }

  handleResize = () => {
    if (this.menuResizeFunc) {
      //console.log("POSPOSP")
      this.setState({ selectionPosition: this.menuResizeFunc(window) })
    }
  }


  handleSend = (e) => {

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
    }

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data)=>{
        this.props.updateData(data.campaignDeliver.campaign, null)
        this.setState({ status: "saved" })
      }, 
      error: ()=>{

      }
    })
  }

  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    return <EditorContentWrapper mode={this.props.mode}>

          <ButtonsContainer>

            <div style={{ alignSelf: 'start'}}>
              <div appearance={this.state.statusButton} isBold>
                {this.state.status}
              </div>
            </div>

          </ButtonsContainer> 
    

          <hr style={{ clear: "both", border: '1px solid #ebecf0' }} />

          <BrowserSimulator mode={this.props.mode}>
            <BrowserSimulatorHeader>
              <BrowserSimulatorButtons>

                <div className={'circleBtn r'}></div>
                <div className={'circleBtn y'}></div>
                <div className={'circleBtn g'}></div>

              </BrowserSimulatorButtons>
            </BrowserSimulatorHeader>

            <EditorPad mode={this.props.mode}>

              <EditorMessengerEmulator mode={this.props.mode}>
                <EditorMessengerEmulatorWrapper mode={this.props.mode}>
                  <EditorMessengerEmulatorHeader mode={this.props.mode}/>
                  <ThemeProvider theme={theme}>
                    <EditorContainer campaign={true}>

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
                            this.generateDecorator("hello"),
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

                    </EditorContainer>
                  </ThemeProvider>
                </EditorMessengerEmulatorWrapper>
              </EditorMessengerEmulator>


            </EditorPad>

          </BrowserSimulator>

       </EditorContentWrapper>

          
  }

}