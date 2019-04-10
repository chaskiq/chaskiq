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
import { soundManager } from 'soundmanager2'
import Quest from './messageWindow'

//import Editor2 from './editor2.js'
//import {Editor} from '@atlaskit/editor-core';

// https://stackoverflow.com/questions/12114356/how-to-get-the-request-timezone
const App = {
  cable: actioncable.createConsumer()
}

const mainColor = "#0a1a27"; //"#42a5f5";

const Container = styled.div`
    position: fixed;
    /* right: 53px; */
    bottom: 92px;
    width: 320px;
    font-size: 12px;
    line-height: 22px;
    font-family: 'Roboto';
    font-weight: 500;
    opacity: ${props => props.open ? 1 : 0};
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
    box-shadow: 1px 1px 100px 2px rgba(0,0,0,0.22);
    border-radius: 10px;
    -webkit-transition: all .2s ease-out;
    -webkit-transition: all .2s ease-in-out;
    -webkit-transition: all .2s ease-in-out;
    transition: all .6s ease-in-out;
    font-family: sans-serif;
`;

const UserAutoMessage = styled.div`
  position: fixed;
  bottom: 0px;
  /* width: 320px; */
  font-size: 12px;
  line-height: 22px;
  font-family: 'Roboto';
  font-weight: 500;
  opacity: ${props => props.open ? 1 : 0};
  -webkit-font-smoothing: antialiased;
  font-smoothing: antialiased;
  box-shadow: 1px 1px 100px 2px rgba(0,0,0,0.22);
  border-radius: 10px;
  -webkit-transition: all .2s ease-out;
  -webkit-transition: all .2s ease-in-out;
  -webkit-transition: all .2s ease-in-out;
  -webkit-transition: all .6s ease-in-out;
  transition: all .6s ease-in-out;
  font-family: sans-serif;
`

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
  bottom: 14px;
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
    min-height: 250px;
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
    margin: 0 0;
    box-shadow: 0 0 4px rgba(0,0,0,.14), 0 4px 8px rgba(0,0,0,.28);
    cursor: pointer;
    -webkit-transition: all .1s ease-out;
    -webkit-transition: all .1s ease-out;
    transition: all .1s ease-out;
    position: relative;
    z-index: 998;
    overflow: hidden;
    background: ${mainColor};
    float: right;
    margin: 5px 20px;
`

const Header = styled.div`
  /* margin: 10px; */
  font-size: 13px;
  font-family: 'Roboto';
  font-weight: 500;
  color: #f3f3f3;
  height: 55px;
  background: ${mainColor};
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding-top: 8px;
`

const Body = styled.div`
  position: relative;
  background: #fff;
  margin: 0px 0 0px 0;
  //height: 300px;
  min-height: 0;
  font-size: 12px;
  line-height: 18px;
  //overflow-y: auto;
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
  display: flex;
  align-items: center;
  transition: background-color .2s ease,box-shadow .2s ease,-webkit-box-shadow .2s ease;
  box-shadow: 0px -6px 58px #ececec;
`

const MessageItem = styled.div`
    position: relative;
    margin: 8px 0 15px 0;
    padding: 8px 10px;
    max-width: 60%;
    min-width: 25%;
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
      background: ${mainColor};
      color: #eceff1; 
    }

    .status {
      position: absolute;
      bottom: 2px;
      width: 100px;
      right: -9px;
      color: #b1afaf;
      font-size: 9px;
    }
`;

const HeaderOption = styled.div`
  //float: left;
  font-size: 15px;
  list-style: none;
  position: relative;
  height: 100%;
  width: 100%;
  text-align: relative;
  margin-right: 10px;
  letter-spacing: 0.5px;
  font-weight: 400;
  display: flex;
  align-items: center;
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
    bottom: 77px;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);

    height: 40px;
    color: rgb(255, 255, 255);
    font-size: 13px;
    line-height: 14px;
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
    padding: 6px;

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

const Hint = styled.p`
    padding: 29px;
    color: rgb(136, 136, 136);
    background: #f9f9f9;
    margin: 0px;
`

const playSound = () => {
  soundManager.createSound({
    id: 'mySound',
    url: '/sounds/picked.mp3',
    autoLoad: true,
    autoPlay: false,
    //onload: function () {
    //  alert('The sound ' + this.id + ' loaded!');
    //},
    volume: 50
  }).play()
}


class Messenger extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversation: {},
      conversation_messages: [],
      conversations: [],
      availableMessage: null,
      display_mode: "conversations",
      open: false,
      appData: {}
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
      this.getConversations()
      this.getMessage()
    })
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.display_mode !== this.state.display_mode && this.display_mode === "conversations")
      this.getConversations()

    if(this.state.conversation.id !== prevState.conversation.id)
      this.conversationSubscriber()
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

  unsubscribeFromConversation = ()=>{
    if (App.conversations)
      App.conversations.unsubscribe()
      App.conversations = null
  }

  conversationSubscriber(){

    this.unsubscribeFromConversation()

    App.conversations = App.cable.subscriptions.create({
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
        console.log(this.props.email , data.app_user.email)
        


        // find message and update it, or just append message to conversation
        if ( this.state.conversation_messages.find( (o)=> o.id === data.id ) ){
          const new_collection = this.state.conversation_messages.map((o)=>{
              if (o.id === data.id ){
                return data
              } else {
                return o
              }
          })

          this.setState({
            conversation_messages: new_collection
          })

        } else {

          this.setState({
            conversation_messages: this.state.conversation_messages.concat(data)
          }, this.scrollToLastItem)
          
          if (this.props.email !== data.app_user.email) {
            playSound()
          }
          /*App.conversations.perform("receive", 
            Object.assign({}, data, {email: this.props.email})
          )*/
        }

      },
      notify: ()=>{
        console.log(`notify!!`)
      },
      handleMessage: (message)=>{
        console.log(`handle message`)
      } 
    });    
  }

  getAvailables = (cb)=>{

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    axios.get(`/api/v1/apps/${this.props.app_id}/messages.json`, {
      headers: { user_data: JSON.stringify(data) }
    })
      .then((response) => {
        //this.setState({ availableMessage: response.data.message })
        if (cb)
          cb(response.data.collection)
      })
      .catch((error) => {
        console.log(error);
      });

  }

  getMessage = (cb)=> {

    this.getAvailables((collection)=>{
      
      if(collection.length === 0)
        return

      const firstKey = collection[0].id

      const data = {
        referrer: window.location.path,
        email: this.props.email,
        properties: this.props.properties
      }

      axios.get(`/api/v1/apps/${this.props.app_id}/messages/${firstKey}.json`, {
        headers: { user_data: JSON.stringify(data) }
      })
        .then((response) => {
          this.setState({ availableMessage: response.data.message })
          if (cb)
            cb()
        })
        .catch((error) => {
          console.log(error);
        });


    })

  }

  ping(cb){
    axios.post(`/api/v1/apps/${this.props.app_id}/ping`, {
        user_data: {
          referrer: window.location.path,
          email: this.props.email,
          properties: this.props.properties
        }
      })
      .then( (response)=> {
        this.setState({
          appData: response.data.app
        }, ()=>{
            console.log("subscribe to events")
            cb()
        })

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

    if(this.state.conversation.id){
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
    this.createCommentOnNewConversation(null, ()=>{
      this.setState({
        conversation_messages: [],
        display_mode: "conversation"
      })
    })
  }

  displayConversationList(e){
    this.unsubscribeFromConversation()
    e.preventDefault()
    this.setState({
      display_mode: "conversations"
    })
  }

  displayConversation(e, o){
    this.setconversation(o.id, ()=>{

      //this.eventsSubscriber()
      this.setState({
        display_mode: "conversation"
      }, ()=> { 
        //this.conversationSubscriber() ; 
        //this.getConversations() ;
        this.scrollToLastItem()
      })
    })
  }

  toggleMessenger = (e)=>{
    this.setState({open: !this.state.open})
  }


  render(){
    return <EditorWrapper>
                
              <Container open={this.state.open}>
                {
                  this.state.open ?  
                    <Fragment>                  
                      <Header>
                        <HeaderOption>
                          { this.state.display_mode === "conversation" ? 
                            <LeftIcon 
                              onClick={this.displayConversationList.bind(this)}
                              style={{margin: '20px', cursor: 'pointer'}}
                            /> : null 
                          }
                          <span style={{marginLeft: '20px'}}>
                            Hello {this.props.name}!
                          </span>
                          {/*this.props.app_id*/}
                        </HeaderOption>
                      </Header>
                      <Body>

                        {
                          this.state.display_mode === "conversation" ? 
                            <EditorSection>

                              <CommentsWrapper innerRef={comp => this.overflow = comp}>
                                {
                                  this.state.conversation_messages.map((o,i)=>{
                                    return <MessageItemWrapper 
                                              email={this.props.email}
                                              key={o.id} 
                                              data={o}>
                                            <MessageItem
                                              className={this.state.conversation.main_participant.email === o.app_user.email ? 'user' : 'admin'}>
                                              <ChatAvatar>
                                                <img src={gravatar.url(o.app_user.email)}/>
                                              </ChatAvatar>

                                              <div  
                                                key={i}
                                                className="text"
                                                dangerouslySetInnerHTML={{__html: o.message}} 
                                              />
                                              <span className="status">
                                                {
                                                  o.read_at ? 
                                                    <Moment fromNow>
                                                      {o.read_at}
                                                    </Moment> : <span>not seen</span>
                                                }
                                              </span>
                                            </MessageItem>
                                          </MessageItemWrapper>

                                  })
                                }
                              </CommentsWrapper>
                              
                              <Footer>
                                <UnicornEditor 
                                  insertComment={this.insertComment}
                                />
                                { /*
                                  <HappinessIcon/>
                                  <AttachmentIcon/>
                                  */
                                }
                                <PaperPlaneIcon style={{ padding: '14px'}}/>
                              </Footer>
                            </EditorSection> : null
                        } 

                        {
                          this.state.display_mode === "conversations" ? 
                            <div>
                              <CommentsWrapper>
                                {
                                  this.state.conversations.map((o,i)=>{
                                    
                                    const message = o.last_message
                                    return <CommentsItem key={o.id}
                                                onClick={(e)=>{this.displayConversation(e, o)}}> 
                                                
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
                                                        <Moment fromNow style={{ float: 'right',
                                                                                                color: '#ccc',
                                                                                                width: '88px',
                                                                                                margin: '0px 10px',
                                                                                                textTransform: 'unset'}}>
                                                                                                {o.created_at}</Moment> 
                                                      </ConversationSummaryBodyMeta>

                                                      <ConversationSummaryBodyContent dangerouslySetInnerHTML={{__html: message.message}} />
                                                    </ConversationSummaryBody>
                                                  </ConversationSummary> : null 
                                              }
                                            </CommentsItem>

                                              
                                  })
                                }
                              </CommentsWrapper>

                              <Hint>
                                We make it simple and seamless for businesses and people to talk to each other. Ask us anything
                              </Hint>

                              <NewConvoBtn onClick={this.displayNewConversation.bind(this)}>
                                create new conversation
                              </NewConvoBtn>

                            </div>
                            : null 
                        }
                      </Body> 
                    </Fragment> : null
                  }
              </Container> 

              {
                  this.state.appData && this.state.appData.active_messenger == "on" ?
                  
                  <Prime onClick={this.toggleMessenger}>
                    <div style={{
                      transition: 'all .2s ease-in-out',
                      transform: !this.state.open ? '' : 'rotate(180deg)',
                    }}>

                      {
                        !this.state.open ?
                        
                          <MessageIcon style={{ 
                            height: '43px',
                            width: '36px',
                            margin: '8px 0px'
                          }}/> : <CloseIcon style={{
                                  height: '26px',
                                  width: '21px',
                                  margin: '11px 0px'
                                }}
                          />
                      }
                    </div>
                  </Prime>  : null
              }

              {
                this.state.availableMessage ? 
                  <UserAutoMessage open={true}>
                    <MessageContainer 
                      availableMessage={this.state.availableMessage}
                    />
                  </UserAutoMessage> : null 
              }
           </EditorWrapper>
  }
}

class MessageContainer extends Component {
  
  createMarkup =()=> { 
    return { __html:  this.props.availableMessage.html_content }; 
  };


  render(){
    return <Quest>
              <div dangerouslySetInnerHTML={this.createMarkup()} />
           </Quest>
  }
}

class MessageItemWrapper extends Component {
  componentDidMount(){
    //console.log(this.props.email)
    //console.log(this.props.data.read_at ? "yes" : "EXEC A READ HERE!")
    // mark as read on first render
    if(!this.props.data.read_at){
      App.conversations.perform("receive", 
        Object.assign({}, this.props.data, {email: this.props.email})
      )
    }
  }
  render(){
    return <Fragment>
            {this.props.children}
           </Fragment>
  }
}

const CloseIcon = props => (
  <svg viewBox="0 0 212.982 212.982" width={512} height={512} {...props}>
    <path
      d="M131.804 106.491l75.936-75.936c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.491 81.18 30.554 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.989 6.99-6.989 18.323 0 25.312l75.937 75.936-75.937 75.937c-6.989 6.99-6.989 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0l75.937-75.937 75.937 75.937c6.989 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.322 0-25.312l-75.936-75.936z"
      fill="#FFF"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)

const LeftIcon = props => (
  <svg viewBox="0 0 492 492" width={20} height={20} {...props}>
    <path
      d="M198.608 246.104L382.664 62.04c5.068-5.056 7.856-11.816 7.856-19.024 0-7.212-2.788-13.968-7.856-19.032l-16.128-16.12C361.476 2.792 354.712 0 347.504 0s-13.964 2.792-19.028 7.864L109.328 227.008c-5.084 5.08-7.868 11.868-7.848 19.084-.02 7.248 2.76 14.028 7.848 19.112l218.944 218.932c5.064 5.072 11.82 7.864 19.032 7.864 7.208 0 13.964-2.792 19.032-7.864l16.124-16.12c10.492-10.492 10.492-27.572 0-38.06L198.608 246.104z"
      fill="#FFF"
    />
  </svg>
)

const MessageIcon = props => (
  <svg viewBox="0 0 60 60" {...props}>
    <path fill="white" d="M10 25.465h13a1 1 0 1 0 0-2H10a1 1 0 1 0 0 2zM36 29.465H10a1 1 0 1 0 0 2h26a1 1 0 1 0 0-2zM36 35.465H10a1 1 0 1 0 0 2h26a1 1 0 1 0 0-2z" />
    <path fill="white" d="M54.072 2.535l-34.142-.07c-3.27 0-5.93 2.66-5.93 5.93v5.124l-8.07.017c-3.27 0-5.93 2.66-5.93 5.93v21.141c0 3.27 2.66 5.929 5.93 5.929H12v10a1 1 0 0 0 1.74.673l9.704-10.675 16.626-.068c3.27 0 5.93-2.66 5.93-5.929v-.113l5.26 5.786a1.002 1.002 0 0 0 1.74-.673v-10h1.07c3.27 0 5.93-2.66 5.93-5.929V8.465a5.937 5.937 0 0 0-5.928-5.93zM44 40.536a3.934 3.934 0 0 1-3.934 3.929l-17.07.07a1 1 0 0 0-.736.327L14 53.949v-8.414a1 1 0 0 0-1-1H5.93A3.934 3.934 0 0 1 2 40.606V19.465a3.935 3.935 0 0 1 3.932-3.93L15 15.516h.002l25.068-.052a3.934 3.934 0 0 1 3.93 3.93v21.142zm14-10.93a3.934 3.934 0 0 1-3.93 3.929H52a1 1 0 0 0-1 1v8.414l-5-5.5V19.395c0-3.27-2.66-5.93-5.932-5.93L16 13.514v-5.12a3.934 3.934 0 0 1 3.928-3.93l34.141.07h.002a3.934 3.934 0 0 1 3.93 3.93v21.142z" />
  </svg>
)

const HappinessIcon = props => (
  <svg viewBox="0 0 295.996 295.996" width={20} height={20} {...props}>
    <path fill="#000" d="M147.998 0C66.392 0 0 66.392 0 147.998s66.392 147.998 147.998 147.998 147.998-66.392 147.998-147.998S229.605 0 147.998 0zm0 279.996c-36.256 0-69.143-14.696-93.022-38.44a132.713 132.713 0 0 1-23.934-32.42C21.442 190.847 16 170.047 16 147.998 16 75.214 75.214 16 147.998 16c34.523 0 65.987 13.328 89.533 35.102 12.208 11.288 22.289 24.844 29.558 39.996 8.27 17.239 12.907 36.538 12.907 56.9 0 72.784-59.214 131.998-131.998 131.998z" />
    <circle fill="#000" cx={99.666} cy={114.998} r={16} />
    <circle fill="#000" cx={198.666} cy={114.998} r={16} />
    <path fill="#000" d="M147.715 229.995c30.954 0 60.619-15.83 77.604-42.113l-13.439-8.684c-15.597 24.135-44.126 37.604-72.693 34.308-22.262-2.567-42.849-15.393-55.072-34.308l-13.438 8.684c14.79 22.889 39.716 38.409 66.676 41.519 3.461.399 6.917.594 10.362.594z" />
  </svg>
)

const GifIcon = props => (
  <svg width={20} height={20} {...props}>
    <path fill="#000" d="M76.5 191.25v57.375c0 21.037 17.212 38.25 38.25 38.25h57.375v-76.5H114.75V229.5H153v38.25h-38.25c-11.475 0-19.125-7.65-19.125-19.125V191.25c0-11.475 7.65-19.125 19.125-19.125h57.375V153H114.75c-21.038 0-38.25 17.212-38.25 38.25zM191.25 172.125h19.125v95.625H191.25v19.125h57.375V267.75H229.5v-95.625h19.125V153H191.25z" />
    <path fill="#000" d="M382.5 95.625H57.375C24.862 95.625 0 120.487 0 153v133.875c0 32.513 24.862 57.375 57.375 57.375H382.5c32.513 0 57.375-24.862 57.375-57.375V153c0-32.513-24.862-57.375-57.375-57.375zm38.25 191.25c0 21.037-17.213 38.25-38.25 38.25H57.375c-21.038 0-38.25-17.213-38.25-38.25V153c0-21.038 17.212-38.25 38.25-38.25H382.5c21.037 0 38.25 17.212 38.25 38.25v133.875z" />
    <path fill="#000" d="M267.75 286.875h19.125V229.5h57.375v-19.125h-57.375v-38.25h76.5V153H267.75z" />
  </svg>
)

const AttachmentIcon = props => (
  <svg viewBox="0 0 51.619 51.619" width={20} height={20} {...props}>
    <path fill="#000" d="M50.14 19.206a.999.999 0 0 0-1.414 0L21.432 46.5a10.617 10.617 0 0 1-7.563 3.119c-2.867 0-5.553-1.107-7.564-3.119s-3.119-4.697-3.119-7.564c0-2.866 1.107-5.552 3.119-7.563L33.598 4.078c2.897-2.896 7.445-2.719 10.579.413 3.133 3.133 3.311 7.682.414 10.579l-25.64 25.641a3.685 3.685 0 0 1-5.203 0 3.684 3.684 0 0 1 0-5.203l17.369-17.369a.999.999 0 1 0-1.414-1.414L12.334 34.093a5.685 5.685 0 0 0 0 8.031 5.685 5.685 0 0 0 8.031 0l25.641-25.641c3.703-3.704 3.525-9.468-.414-13.407-3.938-3.938-9.703-4.117-13.407-.413L4.89 29.958c-2.39 2.389-3.705 5.577-3.705 8.978s1.315 6.59 3.705 8.979c2.389 2.39 5.577 3.705 8.979 3.705 3.4 0 6.589-1.315 8.978-3.705L50.14 20.62a.999.999 0 0 0 0-1.414z" />
  </svg>
)

const PaperPlaneIcon = props => (
  <svg viewBox="0 0 60.062 60.062" width={20} height={20} {...props}>
    <path
      d="M60.046 11.196c.004-.024.011-.048.013-.072a1.054 1.054 0 0 0-.01-.224c-.002-.019.001-.037-.002-.056a1.003 1.003 0 0 0-.1-.289c-.008-.016-.019-.031-.028-.047-.002-.002-.002-.005-.003-.008-.001-.002-.004-.003-.005-.006l-.02-.033a.987.987 0 0 0-.221-.23c-.019-.014-.041-.022-.061-.035a.959.959 0 0 0-.236-.116c-.037-.012-.074-.018-.112-.025a.966.966 0 0 0-.34-.011c-.026.004-.051 0-.077.006L.798 22.046a1 1 0 0 0-.265 1.864l16.632 8.773 2.917 16.187c-.002.012.001.025 0 .037a.94.94 0 0 0 .019.354c.023.095.06.184.11.268.01.016.01.035.021.051.003.005.008.009.012.013.013.019.031.034.046.053.047.058.096.111.152.156.009.007.015.018.025.025.015.011.032.014.047.024.061.04.124.073.191.099.027.01.052.022.08.03.09.026.183.044.277.044h.003l.012-.002a.993.993 0 0 0 .763-.313l11.079-7.386 11.6 7.54a1.005 1.005 0 0 0 .86.11 1 1 0 0 0 .623-.604L59.998 11.38a.915.915 0 0 0 .033-.105c.004-.015.005-.03.008-.044l.007-.035zm-11.582 6.383L24.471 35.22c-.039.029-.07.065-.104.099-.013.012-.026.022-.037.035a1.01 1.01 0 0 0-.059.071c-.018.024-.032.049-.048.074-.037.06-.068.122-.092.188-.005.013-.013.023-.017.036-.001.004-.005.006-.006.01l-2.75 8.937-2.179-12.091 29.285-15zM22.908 46.594l2.726-9.004 4.244 2.759 1.214.789-4.124 2.749-4.06 2.707zm29.136-33.096L18.071 30.899l-14.14-7.458 48.113-9.943zm-7.485 34.006L29.154 37.492l-2.333-1.517 30.154-22.172-12.416 33.701z"
      fill="#000"
      stroke="#000"
    />
  </svg>
)

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