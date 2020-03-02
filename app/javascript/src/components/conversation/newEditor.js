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
import { GiphyBlockConfig } from '../../textEditor/blocks/giphyBlock'
//import { SpeechToTextBlockConfig } from './article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'

import customHTML2Content from 'Dante2/package/es/utils/html2content.js'
import {Map} from 'immutable'
import {
  EditorState,
  convertToRaw
} from 'draft-js'; // { compose


import Link from 'Dante2/package/es/components/decorators/link'
import findEntities from 'Dante2/package/es/utils/find_entities'

import Icons from 'Dante2/package/es/components/icons.js'

import {ThemeProvider} from 'emotion-theming'


import theme from '../../textEditor/theme'
import EditorContainer from '../../textEditor/editorStyles'

import Button from '@material-ui/core/Button'
import SendIcon from '@material-ui/icons/Send'

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


export const ChatEditorInput = styled.div`
   @media (min-width: 320px) and (max-width: 480px) {
      width: 60%;
   }
`

const useStyles = makeStyles(theme => ({
  button: {
    margin: '0px',
    borderLeft: '1px solid #d2d2d2',
    borderRadius: '0px',
  },
  svgIcon: {
    fill: "#000",
  },
  disabledSvgIcon: {
    fill: "#ccc",
  }
}));

const Input = styled.textarea`
  margin: 0px;
  width: 560px;
  height: 81px;
  outline: none;
  border: none;
  padding-left: 10px;
  padding-top: 10px;
  font-size: 1em;
  resize: none;
`

const FallbackNotice = styled.span`
font-size: 0.7em;
padding: 12px;
`

const SubmitButton = function(props){
  const classes = useStyles();
  return <Button
          className={classes.button}
          onClick={props.onClick}
          disabled={props.disabled}>
          <SendIcon 
            className={props.disabled ? classes.disabledSvgIcon : classes.svgIcon}
          />
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
      openGiphy: false,
      read_only: false,
    }

    this.fallbackEditor = this.isMobile()
  }

  isMobile = ()=>{
    var hasTouchScreen = false;
    if ("maxTouchPoints" in navigator) { 
        hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ("msMaxTouchPoints" in navigator) {
        hasTouchScreen = navigator.msMaxTouchPoints > 0; 
    } else {
        var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
        if (mQ && mQ.media === "(pointer:coarse)") {
            hasTouchScreen = !!mQ.matches;
        } else if ('orientation' in window) {
            hasTouchScreen = true; // deprecated, but good fallback
        } else {
            // Only as a last resort, fall back to user agent sniffing
            var UA = navigator.userAgent;
            hasTouchScreen = (
                /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
                /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
            );
        }
    }
    return hasTouchScreen
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

                <ChatEditorInput style={{flexGrow: 3}}>

                  {this.fallbackEditor ? 
                    <FallbackEditor 
                      insertComment={this.props.submitData}
                      saveContent={this.saveContent}
                      setDisabled={this.setDisabled}
                      loading={this.props.loading}
                    /> :

                    <TextEditor theme={theme}
                      tooltipsConfig={this.tooltipsConfig }
                      campaign={true} 
                      uploadHandler={this.uploadHandler}
                      serializedContent={serializedContent }
                      loading={this.props.loading}
                      setDisabled={this.setDisabled}
                      read_only={this.state.read_only}
                      toggleEditable={()=>{
                        this.setState({read_only: !this.state.read_only})
                      }}
                      appendWidgets={
                        [
                          AppPackageBlockConfig({
                            handleFunc: this.handleAppFunc
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
                  }

                </ChatEditorInput>
  
                <SubmitButton 
                  onClick={this.handleSubmit}
                  disabled={this.state.disabled}
                />
  
              </EditorContainer>
          </ThemeProvider>
  }

}

function FallbackEditor({ insertComment, 
                          setDisabled, 
                          loading,
                          saveContent
                        }){

  let input = React.createRef();

  function convertToDraft(sampleMarkup){
    const blockRenderMap = Map({
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
      },
      'code-block': {
        element: 'pre',
        wrapper: null
      }
    })

    const contentState = customHTML2Content(sampleMarkup, blockRenderMap) 
    const fstate2 = EditorState.createWithContent(contentState)
    return JSON.stringify(convertToRaw(fstate2.getCurrentContent()))
  }


  function handleUp(){
    setDisabled(!input.current.value)
    if(input.current.value === "") return

    saveContent({
      html: input.current.value,
      serialized: convertToDraft(input.current.value)
    })

  }

  function handleReturn(e) {
    if (e.key === "Enter") {
      handleSubmit(e)
      return
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if(input.current.value === "") return

    insertComment({
      html: input.current.value,
      serialized: convertToDraft(input.current.value)
    }, () => {
      input.current.value = ""
    })
  }

  return (
    <div>
      <Input
        disabled={ loading }
        onKeyPress={ handleReturn }
        onKeyUp={handleUp}
        placeholder={"write your comment"} 
        //disabled={this.state.loading}
        ref={input}
      />
      <FallbackNotice>editor fallback mobile version</FallbackNotice>
    </div>
  )
}
