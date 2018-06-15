import React, {Component, Fragment} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import actioncable from "actioncable"
import axios from "axios"
import styled from 'styled-components';
import {convertToHTML} from 'draft-convert'
//import Editor from './editor.js'
import UnicornEditor from './editor3.js'
import gravatar from "gravatar"
import Moment from 'react-moment';

//import Editor2 from './editor2.js'
//import {Editor} from '@atlaskit/editor-core';

// https://stackoverflow.com/questions/12114356/how-to-get-the-request-timezone
const App = {
  cable: actioncable.createConsumer()
}

const Container = styled.div`
    position: fixed;
    right: 85px;
    bottom: 20px;
    width: 400px;
    font-size: 12px;
    line-height: 22px;
    font-family: 'Roboto';
    font-weight: 500;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
    //opacity: 0;
    box-shadow: 1px 1px 100px 2px rgba(0, 0, 0, 0.22);
    border-radius: 10px;
    -webkit-transition: all .2s ease-out;
    -webkit-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
`;

const AvatarSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 1;
  /* stylelint-enable */
  grid-area: avatar-area;
  margin-right: 8px;
`;

const EditorSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 2;
  /* stylelint-enable */
  grid-area: editor-area;
`;

const EditorWrapper = styled.div`
  width: 340px;
  position: fixed;
  right: 14px;
  bottom: 0px;
`

const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`

const CommentsWrapper = styled.div`
    min-height: 100px;
    overflow: auto;
    max-height: 250px;
`

const CommentsItem = styled.div`
    padding: 5px;
    /* background-color: #ccc; */
    border-bottom: 1px solid #ececec;
    cursor: pointer;
    &:hover{
      background: aliceblue;
      border-bottom: 1px solid #ececec;
    }
`

const Prime = styled.div`
  display: block;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  text-align: center;
  color: #f0f0f0;
  margin: 25px auto 0;
  box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28);
  cursor: pointer;
  -webkit-transition: all .1s ease-out;
  transition: all .1s ease-out;
  position: relative;
  z-index: 998;
  overflow: hidden;
  background: #42a5f5;
`

const Header = styled.div`
  /* margin: 10px; */
  font-size: 13px;
  font-family: 'Roboto';
  font-weight: 500;
  color: #f3f3f3;
  height: 55px;
  background: #42a5f5;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding-top: 8px;
`

const Body = styled.div`
  position: relative;
  background: #fff;
  margin: 6px 0 0px 0;
  height: 300px;
  min-height: 0;
  font-size: 12px;
  line-height: 18px;
  overflow-y: auto;
  width: 100%;
  float: right;
  //padding-bottom: 100px;
`

const Footer = styled.div`
  width: 100%;
  display: inline-block;
  background: #fff;
  border-top: 1px solid #eee;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
`

const MessageItem = styled.div`
    position: relative;
    margin: 8px 0 15px 0;
    padding: 8px 10px;
    max-width: 60%;
    display: block;
    word-wrap: break-word;
    border-radius: 3px;
    -webkit-animation: zoomIn .5s cubic-bezier(.42, 0, .58, 1);
    animation: zoomIn .5s cubic-bezier(.42, 0, .58, 1);
    clear: both;
    z-index: 999;

    &.user {
      margin-left: 60px;
      float: left;
      background: rgba(0, 0, 0, 0.03);
      color: #666;      
    }

    &.admin {
      margin-right: 20px;
      float: right;
      background: #42a5f5;
      color: #eceff1; 
    }
`;

const HeaderOption = styled.div`
  float: left;
  font-size: 15px;
  list-style: none;
  position: relative;
  height: 100%;
  width: 100%;
  text-align: relative;
  margin-right: 10px;
  letter-spacing: 0.5px;
  font-weight: 400;
`


const ChatAvatar = styled.div`
    left: -52px;
    //background: rgba(0, 0, 0, 0.03);
    position: absolute;
    top: 0;

    img {
      width: 40px;
      height: 40px;
      text-align: center;
      border-radius: 50%;
    }

`

const NewConvoBtn = styled.a`

    background-color: #242424;
    -webkit-box-shadow: 0 4px 12px rgba(0,0,0,.1);
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
    position: absolute;
    bottom: 32px;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);

    height: 40px;
    color: rgb(255, 255, 255);
    font-size: 13px;
    line-height: 40px;
    pointer-events: auto;
    cursor: pointer;
    border-radius: 40px;
    text-align: center;
    -webkit-transition: all .12s;
    transition: all .12s;
    padding: 0 24px;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}`

const ConversationSummary = styled.div`

    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-line-pack: stretch;
    align-content: stretch;
    position: relative;
    padding: 24px;

`

const ConversationSummaryAvatar = styled.div`
      -webkit-box-flex: 0;
      -ms-flex: 0 0 auto;
      flex: 0 0 auto;

      img {
        width: 40px;
        height: 40px;
        text-align: center;
        border-radius: 50%;
      }

`

const ConversationSummaryBody = styled.div`
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      padding-left: 16px;    
`

const ConversationSummaryBodyMeta = styled.div`
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    margin-bottom: 8px;   
`

const ConversationSummaryBodyContent = styled.div`
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      padding-left: 16px;    
`

const Autor = styled.div`
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8b8b8b;
`

class Messenger extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversation: null,
      conversation_messages: [],
      conversations: [],
      display_mode: "conversations"
    }

    this.eventsSubscriber = this.eventsSubscriber.bind(this)
    this.ping = this.ping.bind(this)
    this.insertComment = this.insertComment.bind(this)
    this.createComment = this.createComment.bind(this)
    this.createCommentOnNewConversation = this.createCommentOnNewConversation.bind(this)
    this.getConversations = this.getConversations.bind(this)
    this.setconversation = this.setconversation.bind(this)
  }

  componentDidMount(){
    this.ping(()=> {
      this.eventsSubscriber()
      //this.conversationSubscriber()
      this.getConversations()
    })
  }

  eventsSubscriber(){
    App.events = App.cable.subscriptions.create({
      channel: "PresenceChannel",
      app: this.props.app_id,
      email: this.props.email,
      properties: this.props.properties
    },
    {
        connected: ()=> {
          console.log("connected to presence")
        },
        disconnected: ()=> {
          console.log("disconnected from presence")
        },
        received: (data)=> {
          console.log(`received ${data}`)
        },
        notify: ()=>{
          console.log(`notify!!`)
        },
        handleMessage: (message)=>{
          console.log(`handle message`)
        } 
      });

  }

  scrollToLastItem = ()=>{
    this.overflow.scrollTop = this.overflow.scrollHeight;
  }

  conversationSubscriber(){
    App.events = App.cable.subscriptions.create({
      channel: "ConversationsChannel",
      app: this.props.app_id,
      id: this.state.conversation.id,
      email: this.props.email,
    },
    {
      connected: ()=> {
        console.log("connected to conversations")
      },
      disconnected: ()=> {
        console.log("disconnected from conversations")
      },
      received: (data)=> {
        //let html = stateToHTML(JSON.parse(data.message));
        console.log(data.message)
        console.log(`received ${data}`)
        this.setState({
          conversation_messages: this.state.conversation_messages.concat(data)
        }, this.scrollToLastItem)
      },
      notify: ()=>{
        console.log(`notify!!`)
      },
      handleMessage: (message)=>{
        console.log(`handle message`)
      } 
    });    
  }

  ping(cb){
    axios.post(`/api/v1/apps/${this.props.app_id}/ping`, {
        user_data: {
          referrer: window.location.path,
          email: this.props.email,
          properties: this.props.properties
        }
      })
      .then(function (response) {
        console.log("subscribe to events")
        cb()
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  insertComment(comment, cb){
    //TODO: try to store this as json and then 
    //convert to HTML

    // for now let's save in html
    const html_comment = convertToHTML( comment );

    if(this.state.conversation){
      this.createComment(html_comment, cb)
    }else{
      this.createCommentOnNewConversation(html_comment, cb)
    }
  }

  createComment(comment, cb){
    const id = this.state.conversation.id
    axios.put(`/api/v1/apps/${this.props.app_id}/conversations/${id}.json`, {
        email: this.props.email,
        id: id,
        message: comment
      })
      .then( (response)=> {
        console.log(response)
        cb()
      })
      .catch( (error)=> {
        console.log(error);
      });

  }

  createCommentOnNewConversation(comment, cb){
    axios.post(`/api/v1/apps/${this.props.app_id}/conversations.json`, {
        email: this.props.email,
        message: comment
      })
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation
        }, ()=>{ cb ? cb() : null })
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  getConversations(cb){
    axios.get(`/api/v1/apps/${this.props.app_id}/conversations.json`, {
        email: this.props.email,
      })
      .then( (response)=> {
        this.setState({
          conversations: response.data.collection
        })
        cb ? cb() : null
      })
      .catch( (error)=>{
        console.log(error);
      });
  }

  setconversation(id , cb){
    axios.get(`/api/v1/apps/${this.props.app_id}/conversations/${id}.json`, {
        email: this.props.email,
      })
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation,
          conversation_messages: response.data.messages
        })
        cb ? cb() : null
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  displayNewConversation(e){
    e.preventDefault()
    this.setState({
      conversation: null,
      conversation_messages: [],
      display_mode: "conversation"
    })
  }

  displayConversationList(e){
    e.preventDefault()
    this.setState({
      display_mode: "conversations"
    })
  }

  displayConversation(e, o){
    this.setconversation(o.id, ()=>{

      this.eventsSubscriber()
      this.setState({
        display_mode: "conversation"
      }, ()=> { 
        this.conversationSubscriber() ; 
        this.getConversations() ;
        this.scrollToLastItem()
      })
    })
  }


  render(){
    return <EditorWrapper>
                <Container>
                  <Header>

                    <HeaderOption>
                          Hello {this.props.name}!
                          {this.props.app_id}
                          
                          <a href="#" onClick={this.displayConversationList.bind(this)}>
                            back
                          </a>
                    </HeaderOption>

                  </Header>

                  <Body>

                    {
                      this.state.display_mode === "conversation" ? 
                        <EditorSection>

                          <CommentsWrapper innerRef={comp => this.overflow = comp}>
                            {
                              this.state.conversation_messages.map((o,i)=>{
                                return <MessageItem className={this.state.conversation.main_participant.email === o.app_user.email ? 'user' : 'admin'}>
                                          <ChatAvatar>
                                            <img src={gravatar.url(o.app_user.email)}/>
                                          </ChatAvatar>
                                          <div  
                                            key={i}
                                            dangerouslySetInnerHTML={{__html: o.message}} 
                                          />
                                        </MessageItem>

                              })
                            }
                          </CommentsWrapper>
                          
                          <Footer>
                            <UnicornEditor 
                              insertComment={this.insertComment}
                            />
                          </Footer>
                        </EditorSection> : null
                    } 

                    {
                      this.state.display_mode === "conversations" ? 
                        <div>
                          <CommentsWrapper>
                            {
                              this.state.conversations.map((o,i)=>{
                                console.log("this", this)
                                const t = this
                                const message = o.last_message
                                return <CommentsItem key={o.id}
                                            onClick={(e)=>{t.displayConversation(e, o)}}> 
                                            
                                          {
                                            message ? 
                                              <ConversationSummary>
                                                
                                                <ConversationSummaryAvatar>
                                                  <img src={gravatar.url(message.app_user.email)}/>
                                                </ConversationSummaryAvatar>

                                                <ConversationSummaryBody>

                                                  <ConversationSummaryBodyMeta>
                                                    <Autor>
                                                      {message.app_user.email}
                                                    </Autor>
                                                    <Moment fromNow={o.created_at} style={{float: 'right'}}/> 
                                                  </ConversationSummaryBodyMeta>

                                                  <ConversationSummaryBodyContent dangerouslySetInnerHTML={{__html: message.message}} />
                                                </ConversationSummaryBody>
                                              </ConversationSummary> : null 
                                          }
                                       </CommentsItem>

                                          
                              })
                            }
                          </CommentsWrapper>

                          <p style={{padding: '20px', color: '#888'}}>
                            We make it simple and seamless for businesses and people to talk to each other. Ask us anything
                          </p>

                          <NewConvoBtn onClick={this.displayNewConversation.bind(this)}>
                            create new conversation
                          </NewConvoBtn>

                        </div>
                       : null 
                    }
                  </Body>

                </Container>

                <Prime/>
              
           </EditorWrapper>
  }
}

export default class Hermessenger {

  constructor(props){
    this.props = props
  }

  render(){
    //document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(
        <Messenger {...this.props} />,
        document.getElementById("root")
      )
      
    //})
  }


} 