
//import 'quill/quill.bubble.css';
import Quill from 'quill';
import React, { Component } from 'react';
import styled from "styled-components"
import {QuillStyle} from './styles/quill'
/*import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';*/

import ReactQuill from 'react-quill';
//import 'react-quill/dist/quill.snow.css';

/*import Editor from 'draft-js-plugins-editor';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import styled from "styled-components"
import Button from '@atlaskit/button';
import 'draft-js-hashtag-plugin/lib/plugin.css';*/

/*
const emojiPlugin = createEmojiPlugin({
  useNativeArt: false
});
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
import 'draft-js-emoji-plugin/lib/plugin.css'*/

//import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
//import './styles/dante.css'
/*import { EditorState } from 'draft-js';

const hashtagPlugin = createHashtagPlugin();
const linkifyPlugin = createLinkifyPlugin();
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

const plugins = [
  hashtagPlugin,
  linkifyPlugin,
  inlineToolbarPlugin,
  emojiPlugin
];*/

const EditorContainer = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 56px;
    max-height: 200px;
    border-top: 1px solid #e6e6e6;
`;

const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`

const EditorWrapper = styled.div`
  /*height: 100px;
  display: flex;*/
  width: 80vw;
`

const Input = styled.div`
  padding: 18px 100px 20px 16px;
  /* width: 100%; */
  height: 100%;
  font-family: "Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.33;
  background-color: #fff;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}
`

export default class UnicornEditor extends Component {

  /*state = {
    //editorState: EditorState.createEmpty(),
  };*/

  constructor(props){
    super(props)
   // this.quill = null
   // window.quill = this.quill
   this.state = { text: '' }
  }

  componentDidMount(){
    /*this.quill = new Quill(this.refs.editore, {
      theme: 'bubble'   // Specify theme in configuration
    });*/

  }

  onChange = (editorState) => {
    this.setState({
      text: editorState,
    });
  };

  handleClick = (e) => {
    const content = this.refs.editor
      .getEditorState()
      .getCurrentContent()
    this.props.insertComment(content, () => {
      //this.setState({ editorState: EditorState.createEmpty() })
    })
  }

  handleReturn = (e) => {
    if (!e.shiftKey) {
      this.handleClick()
      return
    }
  }

  handleFocus = (e) => {
    //this.refs.editor.focus()
    //this.quill.focus()
  }

  render() {
    return (

      <EditorWrapper onClick={this.handleFocus}>
        <EditorContainer>
          <Input>
            <QuillStyle>
              <ReactQuill 
                value={this.state.text}
                onChange={this.onChange} 
              />
            </QuillStyle>

            {/*<div id="editore" ref="editore"/>*/}
          </Input>
        </EditorContainer>

        {/*
          <InlineToolbar />
          <EmojiSuggestions />
          <EmojiSelect />
        */}

      </EditorWrapper>


    );
  }
}