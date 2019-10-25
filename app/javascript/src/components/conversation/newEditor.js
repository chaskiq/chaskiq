import React, { Component } from 'react'

import TextEditor from '../../textEditor'
import { DanteImagePopoverConfig } from 'Dante2/package/es/components/popovers/image.js'
import { DanteAnchorPopoverConfig } from 'Dante2/package/es/components/popovers/link.js'
import { DanteInlineTooltipConfig } from './EditorButtons' //'Dante2/package/es/components/popovers/addButton.js'
import { DanteTooltipConfig } from 'Dante2/package/es/components/popovers/toolTip.js' //'Dante2/package/es/components/popovers/toolTip.js'
//import { ImageBlockConfig } from '../../pages/campaigns/article/image'
//import { EmbedBlockConfig } from 'Dante2/package/es/components/blocks/embed.js'
//import { VideoBlockConfig } from 'Dante2/package/es/components/blocks/video.js'
//import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder.js'
//import { VideoRecorderBlockConfig } from 'Dante2/package/es/components/blocks/videoRecorder'
//import { CodeBlockConfig } from 'Dante2/package/es/components/blocks/code'
//import { DividerBlockConfig } from "Dante2/package/es/components/blocks/divider";
//import { ButtonBlockConfig } from "../../editor/components/blocks/button";
//import Prism from 'prismjs';
//import { PrismDraftDecorator } from 'Dante2/package/es/components/decorators/prism'
import { GiphyBlockConfig } from '../../pages/campaigns/article/giphyBlock'
//import { SpeechToTextBlockConfig } from './article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'
import Giphy from '../../textEditor/blocks/giphy'
import Link from 'Dante2/package/es/components/decorators/link'
import findEntities from 'Dante2/package/es/utils/find_entities'

import Icons from 'Dante2/package/es/components/icons.js'

import {ThemeProvider} from 'emotion-theming'


import theme from '../../textEditor/theme'
import EditorContainer from '../../textEditor/editorStyles'

import Button from '@material-ui/core/Button'
import SendIcon from '@material-ui/icons/Send'

import _ from "lodash"

import styled from '@emotion/styled'

import { makeStyles } from '@material-ui/core/styles';

import {AppPackageBlockConfig} from '../../textEditor/blocks/appPackage'
import AppPackagePanel from './appPackagePanel'

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
  .debugControls{
    position:relative;
  }
`

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

const defaultProps = {
  content: null,
  read_only: false,
  spellcheck: false,
  title_placeholder: "Title",
  body_placeholder: "Write your message",

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

export const ChatEditorInput = styled.div`
   @media (min-width: 320px) and (max-width: 480px) {
      width: 60%;
   }
`

const useStyles = makeStyles(theme => ({
  button: {
    margin: '0px',
    borderLeft: '1px solid #d2d2d2',
    borderRadius: '0px'
  }
}));


const SubmitButton = function(props){
  const classes = useStyles();
  return <Button
          className={classes.button}
          onClick={props.onClick}
          disabled={props.disabled}>
          <SendIcon/>
        </Button>
}


export default class ChatEditor extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      data: {},
      status: "",
      plain: null,
      serialized: null,
      html: null,
      statusButton: "inprogress",
      openPackagePanel: false,
      disabled: true,
      openGiphy: false
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
        'footer',
        'column',
        'jumbo',
        'button'
      ],

      widget_options: {
        placeholder: "type a url",
        
        block_types: [
          { label: 'p', style: 'unstyled',  icon: Icons.bold },
          { label: 'h2', style: 'header-one', type: "block" , icon: Icons.h1 },
          { label: 'h3', style: 'header-two', type: "block",  icon: Icons.h2 },

          { type: "separator" },
          { type: "link" },
        
          { label: 'blockquote', style: 'blockquote', type: "block", icon: Icons.blockquote },
          
          { type: "separator" },

          { label: 'code', style: 'code-block', type: "block",  icon: Icons.code },
          { label: 'bold', style: 'BOLD', type: "inline", icon: Icons.bold },
          { label: 'italic', style: 'ITALIC', type: "inline", icon: Icons.italic }
        ]
      }

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

  uploadHandler = ({serviceUrl, imageBlock})=>{
    imageBlock.uploadCompleted(serviceUrl)
  }

  saveContent = (content)=>{
    this.setState({
      status: "saving...",
      statusButton: "success",
      html: content.html,
      serialized: content.serialized
    }, ()=> this.props.saveContentCallback && this.props.saveContentCallback(content) )
  }

  handleSubmit = (e)=>{
    const {html, serialized, text} = this.state
    this.props.submitData({html, serialized})
  }

  saveHandler = (html3, plain, serialized) => {
    debugger
  }

  setDisabled = (val)=>{
    this.setState({disabled: val})
  }

  isDisabled = ()=>{
    this.state.html==="<p class=\"graf graf--p\"></p>" || this.state.disabled
  }

  handleAppFunc  = ()=>{
    this.setState({openPackagePanel: true})
  }

  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    const serializedContent = this.state.serialized ? 
    this.state.serialized : null

    return <ThemeProvider theme={theme}>
              <EditorContainer>

                {this.state.openPackagePanel && <AppPackagePanel 
                  open={this.state.openPackagePanel}
                  close={()=>{
                    this.setState({openPackagePanel: false})
                  }}

                  insertComment={(data)=>{
                    this.props.insertAppBlockComment(data)
                    this.setState({
                      openPackagePanel: false
                    })
                  }}
                />}


                <Giphy 
                  apiKey={"97g39PuUZ6Q49VdTRBvMYXRoKZYd1ScZ"}
                  handleSelected={(data)=>{
                    console.log(data)
                    debugger
                  }}
                  insertComment={(data)=>{
                    this.props.insertAppBlockComment(data)
                    this.setState({
                      openGiphy: false
                    })
                  }}
                />

                <ChatEditorInput style={{flexGrow: 3}}>

                  <TextEditor theme={theme}
                    tooltipsConfig={this.tooltipsConfig }
                    campaign={true} 
                    uploadHandler={this.uploadHandler}
                    serializedContent={serializedContent }
                    loading={this.props.loading}
                    setDisabled={this.setDisabled}
                    appendWidgets={
                      [AppPackageBlockConfig({
                        handleFunc: this.handleAppFunc
                      }),
                      GiphyBlockConfig({
                        handleFunc: ()=>{
                          debugger
                          this.setState({openGiphy: true })
                        }
                      })
                      ]
                    }

                    data={
                        {
                          serialized_content: serializedContent
                        }
                      }
                    styles={
                      {
                        lineHeight: '2em',
                        fontSize: '1.2em'
                      }
                    }
                    saveHandler={this.saveHandler} 
                    updateState={({status, statusButton, content})=> {
                      this.saveContent(content )
                    }
                  }
                /> 
                </ChatEditorInput>
  
                <SubmitButton 
                  onClick={this.handleSubmit}
                  disabled={this.state.disabled}
                />
  
              </EditorContainer>
          </ThemeProvider>




  }

}
