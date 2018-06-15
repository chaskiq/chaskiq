
import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import styled from "styled-components"
import Button from '@atlaskit/button';
import 'draft-js-hashtag-plugin/lib/plugin.css';


const emojiPlugin = createEmojiPlugin({
  useNativeArt: false
});
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
import 'draft-js-emoji-plugin/lib/plugin.css'

//import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import './styles/style.css'
import { EditorState } from 'draft-js';

const hashtagPlugin = createHashtagPlugin();
const linkifyPlugin = createLinkifyPlugin();
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

const plugins = [
  hashtagPlugin,
  linkifyPlugin,
  inlineToolbarPlugin,
  emojiPlugin
];

const EditorContainer = styled.div`
  /* -ms- properties are necessary until MS supports the latest version of the grid spec */
  /* stylelint-disable value-no-vendor-prefix, declaration-block-no-duplicate-properties */
  display: flex;
  flex-direction: column;
  min-width: 272px;
  min-height: 50px;
  max-height: 250px;
  height: auto;
  overflow: auto;
  background-color: white;
  box-sizing: border-box;
  max-width: inherit;
  word-wrap: break-word;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(223, 225, 230);
  border-image: initial;
  border-radius: 3px;
  animation: none;
  padding: 10px;
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
  
`

export default class UnicornEditor extends Component {

  state = {
    editorState: EditorState.createEmpty(),
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  handleClick = (e)=>{
    const content = this.refs.editor
                        .getEditorState()
                        .getCurrentContent()
    this.props.insertComment(content, ()=> {
      this.setState({editorState: EditorState.createEmpty()})
    })
  }

  handleReturn = (e)=>{
    if(!e.shiftKey){
      this.handleClick()
      return
    }
  }

  render() {
    return (

      <EditorWrapper>
        <EditorContainer>
          <Editor
            ref={"editor"}
            editorState={this.state.editorState}
            onChange={this.onChange}
            handleReturn={this.handleReturn}
            plugins={plugins}
          />
        </EditorContainer>

        <InlineToolbar />
        <EmojiSuggestions />

        {/*
          <EmojiSelect />
        */}

      </EditorWrapper>
        
      
    );
  }
}