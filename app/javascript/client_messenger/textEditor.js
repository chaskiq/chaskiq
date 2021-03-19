
import React, { Component } from 'react'
import styled from '@emotion/styled'
import { Picker } from 'mr-emoji'
import { EmojiBlock } from './styles/emojimart'

// import EmojiPicker from 'emoji-picker-react';
// import 'emoji-picker-react/dist/universal/style.scss'; // or any other way you consume scss files

import GiphyPicker from './giphy'

// import {Selector, ResultSort, Rating} from "react-giphy-selector";
import { Map } from 'immutable'

import {
  EditorState,
  convertToRaw
} from 'draft-js' // { compose

import customHTML2Content from './html2Content' // 'Dante2/package/es/utils/html2content.js'
import Loader from './loader'
//

import { imageUpload } from './uploader'

const EditorContainer = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    ${(props) => props.footerClassName
      ? 'min-height: 49px; max-height: 200px; border-top: none;'
      : 'border-top: 1px solid #e6e6e6; min-height: 56px; max-height: 200px;'
    }
    

`

const EditorWrapper = styled.div`
  /*height: 100px;
  display: flex;*/
  width: 80vw;
`

const Input = styled.textarea`
    box-sizing: border-box;
    position: absolute;
    bottom: 0px;
    left: 0;
    color: #000;
    resize: none;
    border: 0;
    padding: 18px 100px 20px 16px;
    width: 100%;
    height: 100%;
    font-family: "Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.33;
    background-color: #fff;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-align: left;
    outline: transparent;
    &:focus {
      background-color: #fff;
      -webkit-box-shadow: 0 0 100px 0 rgba(0,0,0,.1);
      box-shadow: 0 0 100px 0 rgba(0,0,0,.1);
    }

    ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color: "#999";
    }
    ::-moz-placeholder { /* Firefox 19+ */
      color: "#999";
    }
    :-ms-input-placeholder { /* IE 10+ */
      color: "#999";
    }
    :-moz-placeholder { /* Firefox 18- */
      color: "#999";
    }

    :disabled::-webkit-input-placeholder { /* WebKit browsers */
        color: "#f3f3f3";
    }
    :disabled:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
        color: "#f3f3f3";
    }
    :disabled::-moz-placeholder { /* Mozilla Firefox 19+ */
        color: "#f3f3f3";
    }
    :disabled:-ms-input-placeholder { /* Internet Explorer 10+ */
        color: "#f3f3f3";
    }
}
`

const EditorButtons = styled.div`
    position: absolute;
    top: 12px;
    right: 7px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    justify-content: space-around;

    button {
      width: 28px;
      height: 28px;
      line-height: 31px;
      background: transparent;
      border: 1px solid;
      border-color: #999;
      //color: #999;
      border-radius: 999em;
      cursor: pointer;
      text-indent: -6px;

      border-width: 0px;
      outline:none;

      &:disabled{
        opacity: 0.5; 
        pointer-events: none;
      }

      svg{
        width: 26px;
        height: 26px;
        color: #ccc;
        //path {
        //  fill: #555;
        //}

        fill: #555;

        &:hover{
          fill: #c1c1c1
        }
      }
    }
  }
`

const GifIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
    <path d='M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z'
    />
  </svg>
)

const EmojiIcon = () => (

  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'>
    <path d='M6 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-3 5.5c2.14 0 3.92-1.5 4.38-3.5H4.62c.46 2 2.24 3.5 4.38 3.5zM9 1C4.57 1 1 4.58 1 9s3.57 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S5.41 2.5 9 2.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z'
    />
  </svg>
)

const AttachIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'>
    <path d='M13 14c0 2.21-1.79 4-4 4s-4-1.79-4-4V3c0-1.66 1.34-3 3-3s3 1.34 3 3v9c0 1.1-.9 2-2 2s-2-.9-2-2V4h1v8c0 .55.45 1 1 1s1-.45 1-1V3c0-1.1-.9-2-2-2s-2 .9-2 2v11c0 1.66 1.34 3 3 3s3-1.34 3-3V4h1v10z'
    />
  </svg>
)

export default class UnicornEditor extends Component {
  constructor (props) {
    super(props)
    this.input = null
    this.upload_input = null
    this.state = {
      text: '',
      emojiEnabled: false,
      giphyEnabled: false,
      loading: false
    }
  }

  componentDidMount () {
  }

  convertToDraft (sampleMarkup) {
    this.blockRenderMap = Map({
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

    const contentState = customHTML2Content(sampleMarkup, this.extendedBlockRenderMap)
    const fstate2 = EditorState.createWithContent(contentState)
    const s = convertToRaw(fstate2.getCurrentContent())
    return {
      serialized_content: JSON.stringify(s),
      text_content: contentState.getPlainText()
    }
  }

  // https://stackoverflow.com/questions/11076975/insert-text-into-textarea-at-cursor-position-javascript
  insertAtCursor = (myValue) => {
    const myField = this.input
    // IE support
    if (document.selection) {
      myField.focus()
      var sel = document.selection.createRange()
      sel.text = myValue
    } else if (myField.selectionStart || myField.selectionStart === '0') {
      // MOZILLA and others
      var startPos = myField.selectionStart
      var endPos = myField.selectionEnd
      myField.value = myField.value.substring(0, startPos) +
        myValue +
        myField.value.substring(endPos, myField.value.length)
    } else {
      myField.value += myValue
    }
  }

  onChange = (editorState) => {
    this.setState({
      text: editorState
    })
  };

  handleSubmit = (e) => {
    e.preventDefault()

    if (this.input.value === '') return

    const opts = {
      html_content: this.input.value,
      ...this.convertToDraft(this.input.value)
    }

    this.props.insertComment(opts, {
      before: () => {
        this.props.beforeSubmit && this.props.beforeSubmit(opts)
        this.input.value = ''
      },
      sent: () => {
        this.props.onSent && this.props.onSent(opts)
        this.input.value = ''
      }
    })
  }

  submitImage = (link, cb) => {
    const html = `<img width=100% src="${link}" data-type="image"/>`
    const opts = {
      html_content: html,
      ...this.convertToDraft(html)
    }
    this.props.insertComment(opts,
      {
        before: () => {
          this.props.beforeSubmit && this.props.beforeSubmit(opts)
          this.input.value = ''
        },
        sent: () => {
          this.props.onSent && this.props.onSent(opts)
          this.input.value = ''
          cb && cb()
        }
      })
  }

  submitFile = (attrs, cb) => {
    const html = `<img src="${attrs.link}" data-filename="${attrs.filename}" data-type="file" data-content-type="${attrs.content_type}"/>`
    const opts = {
      html_content: html,
      ...this.convertToDraft(html)
    }
    this.props.insertComment(opts,
      {
        before: () => {
          this.props.beforeSubmit && this.props.beforeSubmit(opts)
          this.input.value = ''
        },
        sent: () => {
          this.props.onSent && this.props.onSent(opts)
          this.input.value = ''
          cb && cb()
        }
      })
  }

  handleReturn = (e) => {
    if (e.key === 'Enter') {
      this.handleSubmit(e)
    }
  }

  handleFocus = () => {
    // this.input.focus()
  }

  toggleEmojiClick = (e) => {
    e.preventDefault()
    this.toggleEmoji()
    this.setState({ emojiEnabled: !this.state.emojiEnabled })
  }

  toggleEmoji = () => {
    this.setState({ emojiEnabled: !this.state.emojiEnabled })
  }

  toggleGiphy = (e) => {
    e.preventDefault()
    this.setState({ giphyEnabled: !this.state.giphyEnabled })
  }

  handleEmojiInsert = (emoji) => {
    this.toggleEmoji()
    this.insertAtCursor(emoji.native)
  }

  handleUpload = (ev) => {
    imageUpload(
      ev.target.files[0],
      {
        domain: this.props.domain,
        onLoading: () => {
          this.setLock(true)
        },
        onError: (err) => {
          alert('error uploading')
          console.log(err)
        },
        onSuccess: (attrs) => {
          if (attrs.content_type.match(/image\/(jpg|png|jpeg|gif)/)) {
            this.submitImage(attrs.link)
          } else {
            this.submitFile(attrs)
          }
          this.setLock(false)
        }
      }
    )
  }

  setLock = (val) => {
    this.setState({
      loading: val
    })
  }

  handleInputClick = () => {
    this.upload_input.click()
  }

  // TODO, upload this to activeStorage
  saveGif = (data) => {
    this.submitImage(data.images.downsized_medium.url, () => {
      this.setState({ giphyEnabled: false })
    })
  }

  render () {
    const permittedFiles = 'text/plain, text/markdown, text/x-markdown, image/jpg, image/gif, image/jpeg, image/png, application/pdf, application/csv, application/xls, application/xlsx'
    return (

      <EditorWrapper onClick={this.handleFocus}>
        <EditorContainer footerClassName={this.props.footerClassName}>

          {
            this.state.emojiEnabled &&
              <EmojiBlock>
                <Picker set='apple'
                  emojiSize={20}
                  emoji=''
                  title="hey"
                  onClick={this.handleEmojiInsert} />
              </EmojiBlock>
          }

          {
            this.state.giphyEnabled
              ? <GiphyPicker
                apikey={'97g39PuUZ6Q49VdTRBvMYXRoKZYd1ScZ'}
                handleSelected={this.saveGif}
              /> : null
          }

          <Input
            onKeyPress={this.handleReturn}
            placeholder={this.props.t('editor.placeholder')}
            disabled={this.state.loading}
            ref={(comp) => (this.input = comp)}>
          </Input>

          <EditorButtons>

            {
              this.state.loading &&
              <Loader xs wrapperStyle={{
                opacity: '0.5',
                padding: '0px',
                paddingRight: '12px'
              }}/>
            }

            <button
              disabled={this.state.loading}
              onClick={this.toggleEmojiClick}>
              <EmojiIcon/>
            </button>

            <button
              disabled={this.state.loading}
              onClick={this.toggleGiphy}>
              <GifIcon/>
            </button>

            <button
              disabled={this.state.loading}
              onClick={this.handleInputClick}>
              <AttachIcon/>
              <input
                type="file"
                ref={comp => (this.upload_input = comp)}
                accept={permittedFiles}
                style={{ display: 'none' }}
                onChange={this.handleUpload}
              />
            </button>

          </EditorButtons>

        </EditorContainer>

      </EditorWrapper>

    )
  }
}
