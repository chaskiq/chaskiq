import React, { Component } from 'react'
import {
  isEmpty
} from 'lodash';

import { convertToHTML } from 'draft-convert'
import axios from 'axios'


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

//import jsondiff from "json0-ot-diff"
//import ot from 'ot-json0'

//import { ArticlePad } from './styledBlocks'
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

export const ArticlePad = styled.div`

  @media (max-width: 640px){
    margin: 1rem !important;
    margin-top: 5px !important;
    padding: 1rem;
  }

  @media only screen and (min-width: 1200px){
    margin: 9rem !important;
    margin-top: 18px !important;
  }

  background: white;

  padding: 2rem;
  margin: 2rem !important;
  margin-top: 18px !important;

  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212,9%,64%,.16), 0 1px 2px 0 rgba(39,45,52,.08);
  box-shadow: 0 4px 8px 0 hsla(212,9%,64%,.16), 0 1px 2px 0 rgba(39,45,52,.08);

`

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



export default class CampaignEditor extends Component {

  constructor(props) {
    super(props)

    //this.saveHandler = this.saveHandler.bind(this)
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
      incomingSelectionPosition: []
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
      return JSON.parse(this.props.data.serialized_content) || this.emptyContent()
    } catch (error) {
      return this.emptyContent()
    }
  }

/*
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.params.article_id !== this.props.match.params.article_id) {

      this.setState({ loading: true }, () => {

        this.props.getArticle(this.props.book,
          this.props.match.params.article_id,
          {
            success: () => {
              console.log("article about to change")
              this.setState({ loading: false })
            }
          }
        )

      })
    }

    //if (prevState.currentContent && prevState.currentContent != this.state.currentContent)
    //  this.handleChangesOnCurrentContent(prevState.currentContent, this.state.currentContent)
  }
*/

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
    console.log(menuConfig)
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
        upload_url: `${this.props.url}/attachments.json?mode=${this.props.mode}`,
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
        upload_url: `${this.props.url}/attachments.json?mode=${this.props.mode}`,
      }
    }),
    GiphyBlockConfig(),
    SpeechToTextBlockConfig(),
    ButtonBlockConfig()
    ]
  
  }

  save__Handler = (editorContext, content) => {

    this.setState({
      status: "saving...",
      statusButton: "success"
    })

    axios.put(`${this.save_url}.json`, {
      campaign: {
        html_content: html,
        serialized_content: serialized
      }
    })
      .then((response) => {
        console.log(response)

        this.updateData(response.data)
      }).catch((err) => {
        console.log(err)
      })
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
                <a target="_blank" class="js-mixtapeImage mixtapeImage"
                  href={block.data.provisory_text}
                  style={{ backgroundImage: `url(${data.images[0].url})` }}>
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
          } else {
            <p />
          }
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


    this.setState({
      status: "saving...",
      statusButton: "success"
    })

    if(this.props.data.serialized_content === serialized)
      return

    axios.put(`${this.props.url}.json?mode=${this.props.mode}`, {
      campaign: {
        html_content: html3,
        serialized_content: serialized
      }
    })
      .then((response) => {
        console.log(response)
        
        this.props.updateData(response.data, null)
      }).catch((err) => {
        console.log(err)
      })

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

  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    return <ArticlePad>

      <Dante
        debug={true}
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
    </ArticlePad>
  }

}