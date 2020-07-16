import React, { Component } from "react";
import styled from "@emotion/styled";
import Tabs from "./tabs";
import NewEditor from "./newEditor";
import 'draft-js/dist/Draft.css'

const EditorContainer = styled.div`
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  min-width: 272px;
  min-height: 71px;
  max-height: 250px;
  height: auto;
  overflow: auto;
  background-color: white;
  box-sizing: border-box;
  max-width: inherit;
  word-wrap: break-word;
  border-top: 1px solid rgb(223, 225, 230);
  border-image: initial;
  -webkit-animation: none;
  animation: none;
  //padding: 10px;
  //border: 1px solid #ccc;
  //border-radius: 2px;
  //margin-top: 1px;


  .inlineTooltip-button{
    width: 30px;
    height: 30px;
  }
  .tooltip-icon svg {
    width: 20px;
    height: 20px;
    display: flex;
    margin-left: 6px;
  }
`;

const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`;

const EditorWrapper = styled.div`
  width: 100%;
`;

export default class ConversationEditor extends Component {
  state = {
    loading: false,
    sendMode: 'enter'
  };

  fallbackEditor = false;
  delayTimer = null;

  submitData = (formats, options) => {
    // DANTE does not provide a way to update contentState from outside ?
    // hide and show editor hack
    this.setState(
      {
        loading: true,
      },
      () => {
        options.note
          ? this.props.insertNote(formats, this.enable)
          : this.props.insertComment(formats, this.enable);
      }
    );
  };

  enable = () => {
    this.setState({
      loading: false,
    });
  };

  toggleSendMode = (e)=>{
    this.setState({
      sendMode: this.state.sendMode === 'enter' ? '' : 'enter'
    })
  }

  handleTyping = (content) => {
    // means if content empty
    if (content.html === '<p className="graf graf--p"></p>') return;

    clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(() => {
      this.props.typingNotifier();
    }, 400);
  };

  renderEditor = (opts) => {
    return (
      <EditorWrapper>
        <EditorContainer
          note={opts.note}
          style={opts.note ? { background: "lemonchiffon" } : {}}
        >
          {!this.state.loading ? (
            <NewEditor
              insertAppBlockComment={this.props.insertAppBlockComment}
              submitData={(formats) => this.submitData(formats, opts)}
              saveContentCallback={(content) => this.handleTyping(content)}
              sendMode={ this.state.sendMode }
              {...this.props}
            />
          ) : null}
        </EditorContainer>
      </EditorWrapper>
    );
  };

  render() {
    const tabs = [
      { label: "Reply", content: this.renderEditor({}) },
      { label: "Note", content: this.renderEditor({ note: true }) },
    ];

    return (
      <Tabs
        tabs={tabs}
        onSelect={(tab, index) => console.log("Selected Tab", index + 1)}
        buttons={()=>(
          <div className="flex flex-grow items-center justify-end pr-3">
            
            <input
              id="send_mode"
              type="checkbox"
              checked={this.state.sendMode === 'enter'}
              onChange={(e)=>{ this.toggleSendMode(e)}}
              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <label
              htmlFor="send_mode"
              className="ml-2 block text-xs leading-5 text-gray-900"
            >
              {I18n.t('common.send_on_enter')}
            </label>
            
          </div>
        )}
      />
    );
  }
}
