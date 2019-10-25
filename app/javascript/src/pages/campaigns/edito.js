import React, { Component } from 'react'
import graphql from '../../graphql/client'
import { UPDATE_CAMPAIGN, DELIVER_CAMPAIGN} from '../../graphql/mutations'
import _ from "lodash"
import TextEditor from '../../textEditor'
import styled from '@emotion/styled'
import {ThemeProvider} from 'emotion-theming'
import theme from '../../textEditor/theme'
import EditorContainer from '../../textEditor/editorStyles'

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

const BrowserSimulator = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid #dde1eb;
  -webkit-box-shadow: 0 4px 8px 0 hsla(212,9%,64%,.16), 0 1px 2px 0 rgba(39,45,52,.08);
  box-shadow: 0 4px 8px 0 hsla(212,9%,64%,.16), 0 1px 2px 0 rgba(39,45,52,.08);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
`
const BrowserSimulatorHeader = styled.div`
  background: rgb(199,199,199);
  background: linear-gradient(0deg, rgba(199,199,199,1) 0%, rgba(223,223,223,1) 55%, rgba(233,233,233,1) 100%);
  border-bottom: 1px solid #b1b0b0;
  padding: 10px;
  display:flex;
`
const BrowserSimulatorButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 43px;

  .r{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fc635e;
    border: 1px solid #dc4441;
  }
  .y{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fdbc40;
    border: 1px solid #db9c31;
  }
  .g{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #35cd4b;
    border: 1px solid #24a732;
  }
`

const EditorPad = styled.div`


  ${props => props.mode === "user_auto_messages" ? 
    ` display:flex;
      justify-content: flex-end;
      flex-flow: column;
      height: 90vh;

      .postContent {
        height: 440px;
        overflow: auto;
      }
    ` : 

    `
      padding: 2em;
      background-color: white;
      margin-top: 23px;
      border: 1px solid #ececec;

      @media all and (min-width: 1024px) and (max-width: 1280px) {
        margin: 8em;
      }

      @media (max-width: 640px){
        margin: 2em;
      }
      
    `
  } 
`

const EditorContentWrapper = styled.div`

`

const EditorMessengerEmulator = styled.div`
  ${props => props.mode === "user_auto_messages" ? `
  display:flex;
  justify-content: flex-end;`: ``}
`

const EditorMessengerEmulatorWrapper = styled.div`

  ${props => props.mode === "user_auto_messages" ? 
    `width: 380px;
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
    `: ``}

`

const EditorMessengerEmulatorHeader = styled.div`
  ${props => props.mode === "user_auto_messages" ? `
  padding: 1em;
  border-bottom: 1px solid #ccc;
  ` :``}
`



export default class CampaignEditor extends Component {

  constructor(props) {
    super(props)

    this.ChannelEvents = null
    this.conn = null
    this.menuResizeFunc = null
    this.state = {
      loading: true,
      currentContent: null,
      diff: "",
      videoSession: false,
      selectionPosition: null,
      incomingSelectionPosition: [],
      data: {},
      status: "",
      statusButton: "inprogress"
    }
  }

  saveContent = (content)=>{
    if(this.props.data.serializedContent === content.serialized)
    return

    this.setState({
      status: "saving...",
      statusButton: "success"
    })

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        html_content: content.html,
        serialized_content: content.serialized
    }}

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data)=>{
        this.props.updateData(data.campaignUpdate.campaign, null)
        this.setState({ status: "saved" })
      }, 
      error: ()=>{

      }
    })
  }

  saveHandler = (html3, plain, serialized) => {
    debugger
  }

  uploadHandler = ({serviceUrl, imageBlock})=>{
    imageBlock.uploadCompleted(serviceUrl)
  }


  handleSend = (e) => {

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
    }

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data)=>{
        this.props.updateData(data.campaignDeliver.campaign, null)
        this.setState({ status: "saved" })
      }, 
      error: ()=>{

      }
    })
  }

  render() {
    // !this.state.loading &&
    /*if (this.state.loading) {
      return <Loader />
    }*/

    return <EditorContentWrapper mode={this.props.mode}>

          <ButtonsContainer>

            <div style={{ alignSelf: 'start'}}>
              <div appearance={this.state.statusButton} isBold>
                {this.state.status}
              </div>
            </div>

          </ButtonsContainer> 
    
          <BrowserSimulator mode={this.props.mode}>
            <BrowserSimulatorHeader>
              <BrowserSimulatorButtons>

                <div className={'circleBtn r'}></div>
                <div className={'circleBtn y'}></div>
                <div className={'circleBtn g'}></div>

              </BrowserSimulatorButtons>
            </BrowserSimulatorHeader>

            <EditorPad mode={this.props.mode}>

              <EditorMessengerEmulator mode={this.props.mode}>
                <EditorMessengerEmulatorWrapper mode={this.props.mode}>
                  <EditorMessengerEmulatorHeader mode={this.props.mode}/>

                  
                      <TextEditor 
                        campaign={true} 
                        uploadHandler={this.uploadHandler}
                        serializedContent={this.props.data.serializedContent}
                        data={
                            {
                              serialized_content: this.props.data.serializedContent
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
                          console.log("get content", content)
                          this.saveContent(content )
                        }
                      }
                  />
                    
                  
                
                
                  </EditorMessengerEmulatorWrapper>
              </EditorMessengerEmulator>


            </EditorPad>

          </BrowserSimulator>

       </EditorContentWrapper>

          
  }

}