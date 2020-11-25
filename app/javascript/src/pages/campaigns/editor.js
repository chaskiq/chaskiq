import React, { Component } from "react";
import graphql from "../../graphql/client";
import { UPDATE_CAMPAIGN, DELIVER_CAMPAIGN } from "../../graphql/mutations";
import TextEditor from "../../components/textEditor";
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import styled from "@emotion/styled";
import {
  VisibilityRounded
} from '../../components/icons'

const ButtonsContainer = styled.div`
  display: flex;
  direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  float: right;
  margin: 4px 4px;
`;

const ButtonsRow = styled.div`
  align-self: flex-end;
  clear: both;
  margin: 0px;
  button {
    margin-right: 2px;
  }
`;

const BrowserSimulator = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  box-shadow: 0 4px 8px 0 hsla(212, 9%, 64%, 0.16),
    0 1px 2px 0 rgba(39, 45, 52, 0.08);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
`;
const BrowserSimulatorHeader = styled.div`
  background: rgb(199, 199, 199);
  background: linear-gradient(
    0deg,
    rgba(199, 199, 199, 1) 0%,
    rgba(223, 223, 223, 1) 55%,
    rgba(233, 233, 233, 1) 100%
  );
  border-bottom: 1px solid #b1b0b0;
  padding: 10px;
  display: flex;
`;
const BrowserSimulatorButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 43px;

  .r {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fc635e;
    border: 1px solid #dc4441;
  }
  .y {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fdbc40;
    border: 1px solid #db9c31;
  }
  .g {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #35cd4b;
    border: 1px solid #24a732;
  }
`;

const EditorPad = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? ` display:flex;
      justify-content: flex-end;
      flex-flow: column;
      height: 90vh;

      .postContent {
        height: 440px;
        overflow: auto;
      }
    `
      : `
      padding: 2em;
      background-color: white;
      margin: 2em;
      border: 1px solid #ececec;

      @media all and (min-width: 1024px) and (max-width: 1280px) {
        margin: 4em;
      }

      @media (max-width: 640px){
        margin: 2em;
      }
      
    `}
`;

const EditorContentWrapper = styled.div``;

const EditorMessengerEmulator = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? `
  display:flex;
  justify-content: flex-end;`
      : ``}
`;

const EditorMessengerEmulatorWrapper = styled.div`
  position: relative;
  ${(props) =>
    props.mode === "user_auto_messages"
      ? `width: 380px;
    background: #fff;
    border: 1px solid #f3efef;
    margin-bottom: 25px;
    margin-right: 20px;
    box-shadow: 3px 3px 4px 0px #b5b4b4;
    border-radius: 10px;
    padding: 12px;
    padding-top: 0px;
    .icon-add{
      margin-top: -2px;
      margin-left: -2px;
    }
    `
      : ``}
`;

const EditorMessengerEmulatorHeader = styled.div`
  ${(props) =>
    props.mode === "user_auto_messages"
      ? `
  padding: 1em;
  border-bottom: 1px solid #ccc;
  `
      : ``}
`;

export default class CampaignEditor extends Component {
  constructor(props) {
    super(props);

    this.ChannelEvents = null;
    this.conn = null;
    this.menuResizeFunc = null;
    this.state = {
      loading: true,
      currentContent: null,
      diff: "",
      videoSession: false,
      selectionPosition: null,
      incomingSelectionPosition: [],
      data: {},
      status: null,
      read_only: false,
      preview: false,
    };
  }

  saveContent = (content) => {
    if (this.props.data.serializedContent === content.serialized) return;

    this.setState({
      status: "saving...",
    });

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        html_content: content.html,
        serialized_content: content.serialized,
      },
    };

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignUpdate.campaign, null);
        this.setState({ status: null });
      },
      error: () => {
        this.setState({ status: "error" });
      },
    });
  };

  saveHandler = (html3, plain, serialized) => {
    debugger;
  };

  uploadHandler = ({ serviceUrl, imageBlock }) => {
    imageBlock.uploadCompleted(serviceUrl);
  };

  handleSend = (e) => {
    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
    };

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignDeliver.campaign, null);
        this.setState({ status: "saved" });
      },
      error: () => {},
    });
  };

  togglePreview = ()=>{
    this.setState({preview: !this.state.preview })
  }

  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    return (
      <EditorContentWrapper mode={this.props.mode}>
        <ButtonsContainer>
          <div className="w-full flex justify-end my-2">
            { this.state.status && 
              <Badge 
                className="mr-2" 
                variant={
                this.state.status === 'error' ? 'red' : 'green'
                }>
                {this.state.status}
              </Badge>
            }
            { this.props.mode === 'campaigns' && <Button 
              variant={ this.state.preview ? "contained" : "outlined" }
              size="small"
              onClick={this.togglePreview}>
              <VisibilityRounded/>
              {' '}
              {I18n.t("common.preview")}
            </Button>}
          </div>
        </ButtonsContainer>

        <BrowserSimulator mode={this.props.mode}>
          <BrowserSimulatorHeader>
            <BrowserSimulatorButtons>
              <div className={"circleBtn r"}></div>
              <div className={"circleBtn y"}></div>
              <div className={"circleBtn g"}></div>
            </BrowserSimulatorButtons>
          </BrowserSimulatorHeader>

          <EditorPad mode={this.props.mode}>
            <EditorMessengerEmulator mode={this.props.mode}>
              <EditorMessengerEmulatorWrapper mode={this.props.mode}>
                <EditorMessengerEmulatorHeader mode={this.props.mode} />

                { !this.state.preview && 
                  <TextEditor
                    campaign={true}
                    uploadHandler={this.uploadHandler}
                    serializedContent={this.props.data.serializedContent}
                    read_only={this.state.read_only}
                    toggleEditable={() => {
                      this.setState({ read_only: !this.state.read_only });
                    }}
                    data={{
                      serialized_content: this.props.data.serializedContent,
                    }}
                    styles={{
                      lineHeight: "2em",
                      fontSize: "1.2em",
                    }}
                    saveHandler={this.saveHandler}
                    updateState={({ status, statusButton, content }) => {
                      //console.log("get content", content);
                      this.saveContent(content);
                    }}
                  />
                }

                { this.state.preview && 
                  <Preview 
                    app={this.props.app}
                    campaign={this.props.data}
                  />
                }

              </EditorMessengerEmulatorWrapper>
            </EditorMessengerEmulator>
          </EditorPad>
        </BrowserSimulator>
      </EditorContentWrapper>
    );
  }
}


function Preview({campaign, app}){
  return (
    <div>

      <div className="rounded-md bg-yellow-100 p-4 border-2 border-yellow-400">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm leading-5 font-medium text-yellow-800">
              {I18n.t('campaign.preview')}
            </h3>
            <div className="mt-2 text-sm leading-5 text-yellow-700">
              <p>
                {I18n.t("campaign.preview_hint")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <iframe height="800px" width="100%" 
        src={`/apps/${app.key}/premailer/${campaign.id}?preview=true`} />
      </div>
  )
}
