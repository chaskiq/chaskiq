import React, { Component } from 'react'

import TextEditor from '../textEditor'
import { 
  DanteImagePopoverConfig,
   DanteAnchorPopoverConfig, 
   DanteTooltipConfig ,
   utils,
   Icons,
} from 'Dante2'

import { DanteInlineTooltipConfig } from './EditorButtons' // 'Dante2/package/es/components/popovers/addButton.js'

const {customHTML2Content} = utils // from 'Dante2/package/es/utils/html2content.js'
import { Map } from 'immutable'
import { EditorState, convertToRaw } from 'draft-js' // { compose

//import Icons from 'Dante2/package/es/components/icons.js'

import { ThemeProvider } from 'emotion-theming'

import theme from '../textEditor/theme'
import EditorContainer from '../textEditor/editorStyles'

import styled from '@emotion/styled'

import {
  AppPackageBlockConfig
} from '../textEditor/blocks/appPackage'

import {
  OnDemandTriggersBlockConfig
} from '../textEditor/blocks/onDemandTriggers'

import {
  QuickRepliesBlockConfig
} from '../textEditor/blocks/quickReplies'

import AppPackagePanel from './appPackagePanel'
import TriggersPanel from './triggersPanel'
import QuickReplyPanel from './quickRepliesPanel'

import { SendIcon } from '../icons'

export const ArticlePad = styled.div`
  @media (max-width: 640px) {
    margin: 1rem !important;
    margin-top: 5px !important;
    padding: 1rem;
  }

  @media only screen and (min-width: 1200px) {
    margin: 9rem !important;
    margin-top: 18px !important;
  }

  background: white;

  padding: 2rem;
  margin: 2rem !important;
  margin-top: 18px !important;

  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  .debugControls {
    position: relative;
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

const Input = styled.textarea`
  margin: 0px;
  width: 100%;
  height: 73px;
  outline: none;
  border: none;
  padding-left: 10px;
  padding-top: 10px;
  font-size: 1em;
  resize: none;
  background: transparent;
`

const FallbackNotice = styled.span`
  font-size: 0.7em;
  padding: 12px;
`

const SubmitButton = function (props) {
  return (
    <button
      className={
        `flex w-1/6 justify-center
        bg-white hover:bg-gray-100 
        text-gray-800 font-semibold py-2 
        px-3 border-l border-gray-400 shadow items-center m-2 
        rounded border`
      }
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <SendIcon />
    </button>
  )
}

export default class ChatEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      data: {},
      status: '',
      plain: null,
      serialized: null,
      html: null,
      statusButton: 'inprogress',
      openPackagePanel: false,
      openTriggersPanel: false,
      openQuickReplyPanel: false,
      disabled: true,
      openGiphy: false,
      read_only: false
    }

    this.fallbackEditor = this.isMobile()

    this.editorRef = React.createRef()
  }

  isMobile = () => {
    var hasTouchScreen = false
    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0
    } else if ('msMaxTouchPoints' in navigator) {
      hasTouchScreen = navigator.msMaxTouchPoints > 0
    } else {
      var mQ = window.matchMedia && matchMedia('(pointer:coarse)')
      if (mQ && mQ.media === '(pointer:coarse)') {
        hasTouchScreen = !!mQ.matches
      } else if ('orientation' in window) {
        hasTouchScreen = true // deprecated, but good fallback
      } else {
        // Only as a last resort, fall back to user agent sniffing
        var UA = navigator.userAgent
        hasTouchScreen =
          /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
          /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
      }
    }
    return hasTouchScreen
  };

  tooltipsConfig = () => {
    const inlineMenu = {
      selectionElements: [
        'unstyled',
        'blockquote',
        'ordered-list',
        'unordered-list',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'header-one',
        'header-two',
        'footer',
        'column',
        'jumbo',
        'button'
      ],

      widget_options: {
        placeholder: 'type a url',

        block_types: [
          { label: 'p', style: 'unstyled', icon: Icons.bold },
          { label: 'h2', style: 'header-one', type: 'block', icon: Icons.h1 },
          { label: 'h3', style: 'header-two', type: 'block', icon: Icons.h2 },

          { type: 'separator' },
          { type: 'link' },

          {
            label: 'blockquote',
            style: 'blockquote',
            type: 'block',
            icon: Icons.blockquote
          },

          { type: 'separator' },

          {
            label: 'code',
            style: 'code-block',
            type: 'block',
            icon: Icons.code
          },
          { label: 'bold', style: 'BOLD', type: 'inline', icon: Icons.bold },
          {
            label: 'italic',
            style: 'ITALIC',
            type: 'inline',
            icon: Icons.italic
          }
        ]
      }
    }

    const menuConfig = Object.assign({}, DanteTooltipConfig(), inlineMenu)

    return [
      DanteImagePopoverConfig(),
      DanteAnchorPopoverConfig(),
      DanteInlineTooltipConfig(),
      menuConfig
      // DanteMarkdownConfig()
    ]
  };

  uploadHandler = ({ serviceUrl, imageBlock }) => {
    imageBlock.uploadCompleted(serviceUrl, () => {
      this.setDisabled(false)
    })
  };

  componentDidMount () {
    // this breaks anchors render on editor
    //this.editorRef.current &&
    //this.editorRef.current.refs.editor &&
    //this.editorRef.current.refs.editor.focus()
  }

  saveContent = (content) => {
    this.setState(
      {
        status: 'saving...',
        statusButton: 'success',
        html: content.html,
        serialized: content.serialized
      },
      () =>
        this.props.saveContentCallback &&
        this.props.saveContentCallback(content)
    )
  };

  handleSubmit = () => {
    const { html, serialized, _text } = this.state
    this.props.submitData({ html, serialized })
  };

  saveHandler = (_html3, _plain, _serialized) => {
  };

  setDisabled = (val) => {
    this.setState({ disabled: val })
  };

  isDisabled = () => {
    return (
      this.state.html === '<p className="graf graf--p"></p>' ||
      this.state.disabled
    )
  };

  handleAppFunc = () => {
    this.setState({ openPackagePanel: true })
  };

  handleBotFunc = () => {
    this.setState({ openTriggersPanel: true })
  };

  handleQuickRepliesFunc = () => {
    this.setState({ openQuickReplyPanel: true })
  }

  render () {
    const serializedContent = this.state.serialized
      ? this.state.serialized
      : null

    return (
      <ThemeProvider theme={theme}>
        <EditorContainer className="flex">
          {this.state.openPackagePanel && (
            <AppPackagePanel
              kind={'conversations'}
              open={this.state.openPackagePanel}
              close={() => {
                this.setState({ openPackagePanel: false })
              }}
              insertComment={(data) => {
                this.props.insertAppBlockComment(data, () => {
                  this.setState({
                    openPackagePanel: false
                  })
                })
              }}
            />
          )}

          {this.state.openQuickReplyPanel && (
            <QuickReplyPanel
              open={this.state.openQuickReplyPanel}
              close={() => {
                this.setState({ openQuickReplyPanel: false })
              }}
              insertComment={(data) => {
                this.props.insertComment(data, () => {
                  this.setState({
                    openQuickReplyPanel: false
                  })
                })
              }}
            />
          )}

          {this.state.openTriggersPanel && (
            <TriggersPanel
              open={this.state.openTriggersPanel}
              close={() => {
                this.setState({ openTriggersPanel: false })
              }}
              insertComment={(data) => {
                this.props.insertAppBlockComment(data, () => {
                  this.setState({
                    openTriggersPanel: false
                  })
                })
              }}
            />
          )}

          <ChatEditorInput style={{ flexGrow: 3 }}>
            {this.fallbackEditor ? (
              <FallbackEditor
                insertComment={this.props.submitData}
                saveContent={this.saveContent}
                setDisabled={this.setDisabled}
                loading={this.props.loading}
              />
            ) : (
              <TextEditor
                theme={theme}
                inlineMenu={true}
                tooltipsConfig={this.tooltipsConfig}
                campaign={true}
                uploadHandler={this.uploadHandler}
                serializedContent={serializedContent}
                loading={this.props.loading}
                setDisabled={this.setDisabled}
                read_only={this.state.read_only}
                //ref={this.editorRef} // this breaks the anchors on editor
                handleReturn={(e, isEmptyDraft) => {
                  if (isEmptyDraft || this.isDisabled()) return
                  if (this.props.sendMode == 'enter' && !e.nativeEvent.shiftKey) {
                    return this.handleSubmit()
                  }
                }}
                toggleEditable={() => {
                  this.setState({ read_only: !this.state.read_only })
                }}

                appendWidgets={[
                  AppPackageBlockConfig({
                    handleFunc: this.handleAppFunc
                  }),
                  OnDemandTriggersBlockConfig({
                    handleFunc: this.handleBotFunc
                  }),
                  QuickRepliesBlockConfig({
                    handleFunc: this.handleQuickRepliesFunc
                  })
                ]}
                data={{
                  serialized_content: serializedContent
                }}
                styles={{
                  lineHeight: '2em',
                  fontSize: '1.2em'
                }}
                saveHandler={this.saveHandler}
                updateState={({ _status, _statusButton, content }) => {
                  this.saveContent(content)
                }}
              />
            )}
          </ChatEditorInput>

          {
            this.props.sendMode != 'enter' && <SubmitButton
              onClick={this.handleSubmit}
              disabled={this.state.disabled}
            />
          }

        </EditorContainer>
      </ThemeProvider>
    )
  }
}

function FallbackEditor ({ insertComment, setDisabled, loading, saveContent }) {
  const input = React.createRef()

  function convertToDraft (sampleMarkup) {
    const blockRenderMap = Map({
      image: {
        element: 'figure'
      },
      video: {
        element: 'figure'
      },
      embed: {
        element: 'div'
      },
      unstyled: {
        wrapper: null,
        element: 'div'
      },
      paragraph: {
        wrapper: null,
        element: 'div'
      },
      placeholder: {
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

  function handleUp () {
    setDisabled(!input.current.value)
    if (input.current.value === '') return

    saveContent({
      html: input.current.value,
      serialized: convertToDraft(input.current.value)
    })
  }

  function handleReturn (e) {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  function handleSubmit (e) {
    e.preventDefault()
    if (input.current.value === '') return

    insertComment(
      {
        html: input.current.value,
        serialized: convertToDraft(input.current.value)
      },
      () => {
        input.current.value = ''
      }
    )
  }

  return (
    <div className="w-full">
      <Input
        disabled={loading}
        onKeyPress={handleReturn}
        onKeyUp={handleUp}
        placeholder={'write your comment'}
        // disabled={this.state.loading}
        ref={input}
      />
      <FallbackNotice>editor fallback mobile version</FallbackNotice>
    </div>
  )
}
