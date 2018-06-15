
import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import styled from "styled-components"
import Button from '@atlaskit/button';
import 'draft-js-hashtag-plugin/lib/plugin.css';

import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';

const emojiPlugin = createEmojiPlugin({
  useNativeArt: false
});
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
import 'draft-js-emoji-plugin/lib/plugin.css'

//import 'draft-js-inline-toolbar-plugin/lib/plugin.css'
import '../../components2/styles/style.css'
import { EditorState } from 'draft-js';

const hashtagPlugin = createHashtagPlugin();
const linkifyPlugin = createLinkifyPlugin();
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

const {hasCommandModifier} = KeyBindingUtil;
function myKeyBindingFn(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
    return 'myeditor-save';
  }
  return getDefaultKeyBinding(e);
}

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

export default class ConversationEditor extends Component {

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

  handleKeyCommand(command: string): DraftHandleValue {
    //this.editorState.getSelection()
    if (command === 'myeditor-save') {
      // Perform a request to save your contents, set
      // a new `editorState`, etc.
      return 'handled';
    }
    return 'not-handled';
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
        <EditorContainer style={{
          height: '87px', 
          marginBottom: '31px'
        }}>
          <Editor
            ref={"editor"}
            editorState={this.state.editorState}
            onChange={this.onChange}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={myKeyBindingFn}
            handleReturn={this.handleReturn}
            plugins={plugins}
          />
        </EditorContainer>

        <InlineToolbar />
        <EmojiSuggestions />

        {/*
          <EmojiSelect />
        */}

        <EditorActions>
          <Button 
            appearance={"primary"} 
            onClick={this.handleClick.bind(this)}>
            oli
          </Button>
        </EditorActions>

      </EditorWrapper>
        
      
    );
  }
}