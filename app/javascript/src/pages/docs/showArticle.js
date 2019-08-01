
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { convertToHTML } from 'draft-convert'

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

import {ThemeProvider} from 'emotion-theming'
import EditorStyles from 'Dante2/package/es/styled/base'

//import EditorContainer from '../../components/conversation/editorStyles'
import theme from '../../components/conversation/theme'

import styled from '@emotion/styled'

import CircularProgress from '@material-ui/core/CircularProgress';



const EditorStylesExtend = styled(EditorStyles)`

  line-height: 2em;
  font-size: 1.2em; 

  .graf--p{
    line-height: 2em;
    font-size: 1.2em; 
  }

  .dante-menu{
    z-index: 2000;
  }

  blockquote {
    margin-left: 20px;
  }
`

const defaultProps = {
  content: null,
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

export default class ArticleEditor extends Component {


  emptyContent = () => {
    return { 
      "entityMap": {},
      "blocks": [
        { "key": "f1qmb", "text": "", "type": "unstyled", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }, 
      ] 
    }
  }

  defaultContent = () => {
    try {
      return JSON.parse(this.props.article.content.serialized_content) || this.emptyContent()
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

  widgetsConfig = () => {
    return [CodeBlockConfig(),
    ImageBlockConfig({
      options: {
        //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
        //upload_handler: this.props.uploadHandler,
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
        //upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
      }
    }),
    GiphyBlockConfig(),
    SpeechToTextBlockConfig(),
    ButtonBlockConfig()
    ]
  
  }

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json)
    return EditorState.createWithContent(new_content)
  }


  render(){

      return <ThemeProvider theme={theme}>
           <EditorStylesExtend campaign={true}>


             {
               !this.props.loading ?
             
                <DanteEditor
                  {...defaultProps}
                  debug={false}
                  readOnly={true}
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
                /> : <CircularProgress/>
            }

           </EditorStylesExtend>
         </ThemeProvider>

  }


}
