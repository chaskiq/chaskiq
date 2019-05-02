/* eslint-disable no-unused-expressions */

import React, {Component, Fragment} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import actioncable from "actioncable"
import axios from "axios"

import UnicornEditor from './editor.js'
import gravatar from "gravatar"
import Moment from 'react-moment';
import { soundManager } from 'soundmanager2'
import Quest from './messageWindow'

import StyledFrame from 'react-styled-frame'
import styled, { ThemeProvider } from 'styled-components'
import DanteContainer from './styles/dante'
import CrossIcon from '@atlaskit/icon/glyph/cross';
import Button from '@atlaskit/button';
import sanitizeHtml from 'sanitize-html';
import {
  CloseIcon,
  LeftIcon,
  MessageIcon,
  } from './icons'

import {
  Container,
  UserAutoMessage,
  AvatarSection,
  EditorSection,
  EditorWrapper,
  EditorActions,
  CommentsWrapper,
  CommentsItem,
  Prime,
  Header,
  Body,
  Footer,
  ReadIndicator,
  MessageItem,
  HeaderOption,
  ChatAvatar,
  UserAutoChatAvatar,
  NewConvoBtn,
  ConversationSummary,
  ConversationSummaryAvatar,
  ConversationSummaryBody,
  ConversationSummaryBodyMeta,
  ConversationSummaryBodyContent,
  Autor,
  Hint,
  ConversationsFooter
} from './styles/styled'

// https://stackoverflow.com/questions/12114356/how-to-get-the-request-timezone

const SuperDuper = styled(StyledFrame)`
  /*
  display: block;
  overflow: scroll;
  border: 0px;
  z-index: 10000;
  position: absolute;
  width: 100%;
  margin: 0px auto;
  height: 415px;
  bottom: 83px;

  @media (min-width: 320px) and (max-width: 480px) {
    display: block;
    overflow: scroll;
    border: 0px;
    z-index: 1000000000;
    position: absolute;
    width: 100%;
    margin: 0px auto;
    height: 102vh;
    bottom: -6px;
    width: calc(100vw + 20px);
    left: -12px;
  }
  */

  width: 100%;
  height: 100%;
  position: absolute;
`

const UserAutoMessageStyledFrame = styled(({ isMinimized, ...rest })=>(
  <StyledFrame {...rest}/>
  ))`
    display: block;
    /* overflow: scroll; */
    border: 0px;
    display: block;
    /* overflow: scroll; */
    border: 0px;
    z-index: 1000;
    ${(props)=>{
      return props.isMinimized ? `height: 11vh;` : `height: 70vh;`
    }}
    
    width: 350px;
    /* width: 100%; */
    position: absolute;
    ${(props)=>{
      return props.theme.isMessengerActive ? `
        bottom: 83px;
        right: 17px;
      ` : `
        bottom: 0px;
        right: 0px;
      `
    }}

    /* box-shadow: 1px 1px 100px 2px rgba(0,0,0,0.22); */
`

const CloseButtonWrapper = styled.div`
  position: absolute;
  right: 10px;
`

const SuperFragment = styled.div`
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
}
`

const UserAutoMessageFlex = styled.div`
  display: flex;
  flex-direction: column;
  /* align-items: baseline; */
  height: 100vh;
  /* flex-direction: row; */
  /* flex-grow: 1; */
  justify-content: space-between;
`


let App = {}


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
      appData: {},
      isMinimized: false,
      isMobile: false,
    }

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    this.defaultHeaders = {
      user_data: JSON.stringify(data)
    }

    this.defaultCableData = {
      app: this.props.app_id,
      email: this.props.email,
      properties: this.props.properties
    }

    if(this.props.encryptedMode){
      this.defaultHeaders = { enc_data: this.props.encData }
      this.defaultCableData = { app: this.props.app_id, enc_data: this.props.encData }
    }

    this.axiosInstance = axios.create({
      baseURL: `${this.props.domain}`,
      headers: this.defaultHeaders
      /* other custom settings */
    });
    

    App = {
      cable: actioncable.createConsumer(`${this.props.ws}`)
    }

    this.eventsSubscriber = this.eventsSubscriber.bind(this)
    this.ping = this.ping.bind(this)
    this.insertComment = this.insertComment.bind(this)
    this.createComment = this.createComment.bind(this)
    this.createCommentOnNewConversation = this.createCommentOnNewConversation.bind(this)
    this.getConversations = this.getConversations.bind(this)
    this.setconversation = this.setconversation.bind(this)

    this.overflow = null
    this.commentWrapperRef = React.createRef();

  }

  componentDidMount(){
    this.ping(()=> {
      this.eventsSubscriber()
      this.getConversations()
      this.getMessage()
    })

    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.display_mode !== this.state.display_mode && this.state.display_mode === "conversations")
      this.getConversations()

    if (prevState.open !== this.state.open && this.state.open && this.state.display_mode === "conversations")
      this.getConversations()

    //if(this.state.conversation.id !== prevState.conversation.id)
      //this.conversationSubscriber()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  detectMobile = ()=>{
    return window.matchMedia("(min-width: 320px) and (max-width: 480px)").matches
  }

  updateDimensions = ()=>{
    this.setState({ isMobile: this.detectMobile() })
  }

  cableDataFor =(opts)=>{
    return Object.assign({}, this.defaultCableData, opts)
  }

  playSound = () => {
    soundManager.createSound({
      id: 'mySound',
      url: `${this.props.domain}/sounds/picked.mp3`,
      autoLoad: true,
      autoPlay: false,
      //onload: function () {
      //  alert('The sound ' + this.id + ' loaded!');
      //},
      volume: 50
    }).play()
  }

  eventsSubscriber(){
    App.events = App.cable.subscriptions.create(this.cableDataFor({channel: "PresenceChannel"}),
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
    if(!this.overflow)
      return
    
    this.overflow.scrollTop = this.overflow.scrollHeight 
  }

  unsubscribeFromConversation = ()=>{
    if (App.conversations)
      App.conversations.unsubscribe()
      App.conversations = null
  }

  conversationSubscriber(cb){
    this.unsubscribeFromConversation()

    App.conversations = App.cable.subscriptions.create(
      this.cableDataFor({
        channel: "ConversationsChannel", 
        id: this.state.conversation.id,
      }),
    {
      connected: ()=> {
        console.log("connected to conversations")
        if( cb )
          cb()
      },
      disconnected: ()=> {
        console.log("disconnected from conversations")
      },
      received: (data)=> {
        //let html = stateToHTML(JSON.parse(data.message));
        //console.log(data.message)
        //console.log(`received ${data}`)
        //console.log(this.props.email , data.app_user.email)

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
            this.playSound()
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

    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/messages.json`)
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
      
      if(collection.length === 0){
        this.setState({availableMessage: null})
        return

      }

      const firstKey = collection[0].id

      const data = {
        referrer: window.location.path,
        email: this.props.email,
        properties: this.props.properties
      }

      this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/messages/${firstKey}.json`)
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
    this.axiosInstance.post(`/api/v1/apps/${this.props.app_id}/ping`)
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

    // for now let's save in html (this is draft)
    //const html_comment = convertToHTML( comment );

    // this is slate
    
    if(this.state.conversation.id){
      this.createComment(comment, cb)
    }else{
      this.createCommentOnNewConversation(comment, cb)
    }
  }

  createComment(comment, cb){
    const id = this.state.conversation.id
    this.axiosInstance.put(`/api/v1/apps/${this.props.app_id}/conversations/${id}.json`, {
      email: this.props.email,
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
    this.axiosInstance.post(`/api/v1/apps/${this.props.app_id}/conversations.json`, {
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

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }
    
    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/conversations.json`)
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
    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/conversations/${id}.json`)
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation,
          conversation_messages: response.data.messages
        }, cb)
        
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  displayNewConversation(e){
    e.preventDefault()
    this.createCommentOnNewConversation(null, ()=>{

      this.conversationSubscriber(() => {

        //this.eventsSubscriber()
        this.setState({
          conversation_messages: [],
          display_mode: "conversation"
        }, () => {
          //this.conversationSubscriber() ; 
          //this.getConversations() ;
          this.scrollToLastItem()
        })

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

    this.unsubscribeFromConversation()

    this.setconversation(o.id, () => {

      this.conversationSubscriber(() => {
        
        //this.eventsSubscriber()
        this.setState({
          display_mode: "conversation"
        }, () => {
          //this.conversationSubscriber() ; 
          //this.getConversations() ;
          this.scrollToLastItem()
        })

      })

      
    })

  }

  toggleMessenger = (e)=>{
    this.setState({
      open: !this.state.open, 
      display_mode: "conversations"
    })
  }

  isUserAutoMessage = (o)=>{
    return o.message_source && o.message_source.type === "UserAutoMessage"
  }

  isMessengerActive = ()=>{
    return this.state.appData && this.state.appData.active_messenger == "on"
  }

  render(){
    return <ThemeProvider theme={{
                                  mode: this.state.availableMessage ? this.state.availableMessage.theme : 'light',
                                  isMessengerActive: this.isMessengerActive() 
                                }}>
            <EditorWrapper>

              {
                this.state.open ?
                    <Container 
                            open={this.state.open} 
                            isMobile={this.state.isMobile}>
                            
                            <SuperDuper> 
                              <SuperFragment>
                                <Header isMobile={this.state.isMobile}>
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

                                    {
                                      this.state.isMobile ?
                                      <CloseButtonWrapper>
                                        <Button
                                          appearance="subtle-link"
                                          onClick={() => this.toggleShowIcons()}
                                          spacing="none"
                                        >
                                          <CrossIcon onClick={this.toggleMessenger} />
                                        </Button>
                                      </CloseButtonWrapper> : null
                                    }
                                    

                                    {/*this.props.app_id*/}
                                  </HeaderOption>
                                </Header>
                                <Body>

                                  {
                                    this.state.display_mode === "conversation" ?
                                    
                                      <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        bottom: '0',
                                        left: '0',
                                        right: '0'
                                      }}>
                                      <div 
                                        ref={comp => this.overflow = comp}
                                        style={{ overflowY: 'auto', height: '100%' }}>

                                          <EditorSection>

                                            <CommentsWrapper
                                              //ref={this.commentWrapperRef}
                                              isMobile={this.state.isMobile}>
                                              {
                                                this.state.conversation_messages.map((o, i) => {
                                                  return <MessageItemWrapper
                                                    email={this.props.email}
                                                    key={o.id}
                                                    data={o}>
                                                    <MessageItem
                                                      className={this.state.conversation.main_participant.email === o.app_user.email ? 'user' : 'admin'}
                                                      messageSourceType={o.message_source ? o.message_source.type : '' }>
                                                      
                                                      {
                                                        !this.isUserAutoMessage(o) ? 
                                                          <ChatAvatar>
                                                            <img src={gravatar.url(o.app_user.email)} />
                                                          </ChatAvatar> : null
                                                      }



                                                      <DanteContainer>

                                                        {
                                                          this.isUserAutoMessage(o) ?
                                                            <UserAutoChatAvatar>
                                                              <img src={gravatar.url(o.app_user.email)} />
                                                              <span>{o.app_user.name || o.app_user.email}</span>
                                                            </UserAutoChatAvatar> : null
                                                        } 

                                                        <div
                                                          key={i}
                                                          className={ this.isUserAutoMessage(o) ? '' : "text"}
                                                          dangerouslySetInnerHTML={{ __html: o.message }}
                                                        />
                                                      </DanteContainer>


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
                                                  <PaperPlaneIcon
                                                    style={{ padding: '14px' }}
                                                  />
                                                  */
                                              }

                                              
                                            </Footer>

                                          </EditorSection>
                                              
                                        </div>
                                      </div> : null
                                  } 

                                  {
                                    this.state.display_mode === "conversations" ? 
                                      <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        bottom: '0',
                                        left: '0',
                                        right: '0'
                                      }}>
                                        <div style={{ overflowY: 'auto', height: '100%'}}>
                                          <CommentsWrapper isMobile={this.state.isMobile}>
                                            {
                                              this.state.conversations.map((o,i)=>{
                                                
                                                const message = o.last_message
                                                const sanitized = sanitizeHtml(message.message)
                                                const summary = sanitized.length > 100 ? `${sanitized.substring(0, 100)} ...` : sanitized
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

                                                                  {
                                                                    !message.read_at && message.app_user.email !== this.props.email ?
                                                                  
                                                                    <ReadIndicator/> : null
                                                                  }
                                                                    <Autor>
                                                                      {message.app_user.email}
                                                                    </Autor>
                                                                    <Moment fromNow style={{ float: 'right',
                                                                                                            color: '#ccc',
                                                                                                            width: '88px',
                                                                                                            margin: '0px 10px',
                                                                                                            textTransform: 'unset'}}>
                                                                                                            {message.created_at}</Moment> 
                                                                  </ConversationSummaryBodyMeta>
                                                                  {/* TODO: sanitize in backend */}
                                                                  <ConversationSummaryBodyContent 
                                                                    dangerouslySetInnerHTML={{ __html: summary }} 
                                                                  />
                                                                </ConversationSummaryBody>
                                                              </ConversationSummary> : null 
                                                          }
                                                        </CommentsItem>

                                                          
                                              })
                                            }
                                          </CommentsWrapper>

                                          <ConversationsFooter>
                                            <Hint>
                                              We make it simple and seamless for businesses and people to talk to each other. Ask us anything
                                              </Hint>

                                            <NewConvoBtn onClick={this.displayNewConversation.bind(this)}>
                                              create new conversation
                                            </NewConvoBtn>                                
                                          </ConversationsFooter>

                                        </div>
                                      </div>
                                      : null 
                                  }
                                </Body> 
                              </SuperFragment>
                            </SuperDuper> 
                          
                      </Container>  : null
              } 

              { 
                  this.state.appData && this.state.appData.active_messenger == "on" ?
                  <StyledFrame style={{
                      zIndex: '10000000',
                      position: 'absolute',
                      bottom: '-14px',
                      width: '88px',
                      height: '100px',
                      right: '-9px'
                    }}>
    
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
                    </Prime>  
                  </StyledFrame> : null
              }


              {
                this.state.availableMessage ? 
                  <MessageFrame
                    appId={this.props.app_id}
                    getMessage={this.getMessage}
                    axiosInstance={this.axiosInstance}
                    availableMessage={this.state.availableMessage}
                  /> : <div/>
              }
              
            </EditorWrapper>
          </ThemeProvider>
          }
}


class MessageFrame extends Component {

  constructor(props){
    super(props)
    this.defaultMinized = false
    this.state = {
      isMinimized: this.fetchMinizedCache()
    }
  }

  toggleMinimize = (e) => {
    const val = !this.state.isMinimized
    console.log("toggle, ", val, "old ", this.state.isMinimized)
    this.cacheMinized(val)
    this.setState({ isMinimized: val })
  }

  messageCacheKey = (id) => {
    return `hermes-message-${id}`
  }

  cacheMinized = (val) => {
    const key = this.messageCacheKey(this.props.availableMessage.id)
    console.log("minimize", key, val)
    //if (this.localStorageEnabled)
    localStorage.setItem(key, val);
  }

  fetchMinizedCache = () => {
    if (!this.props.availableMessage)
      return false

    const key = this.messageCacheKey(this.props.availableMessage.id)

    let val = localStorage.getItem(key);

    switch (val) {
      case "false":
        return false
      case "true":
        return true
      default:
        return this.defaultMinized
    }
  }

  handleClose = ()=>{
    const appId = this.props.appId
    const messageId = this.props.availableMessage.id
    const trackUrl = this.props.availableMessage.user_track_url
    const url = `/api/v1/apps/${appId}/messages/${messageId}/tracks/${trackUrl}/close.json`
    this.props.axiosInstance.get(url, {r: 'close'})
    .then((response) => {
      console.log("handle close!!!")
      this.props.getMessage()
      //this.setState({ availableMessage: response.data.message })
    })
    .catch((error) => {
      console.log(error);
    });
  }


  render(){
    return <UserAutoMessageStyledFrame id="messageFrame" 
      isMinimized={this.fetchMinizedCache()}>
      <UserAutoMessageFlex>
        {
          <UserAutoMessage open={true}>
            <MessageContainer
              isMinimized={this.state.isMinimized}
              toggleMinimize={this.toggleMinimize}
              handleClose={this.handleClose}
              availableMessage={this.props.availableMessage}
            />
          </UserAutoMessage>
        }


        {
          /*
          <iframe frameborder="0" height="100%"
            src="https://prey.typeform.com/to/TxwKrk?typeform-embed=embed-widget&amp;typeform-embed-id=atsi1" 
            width="100%"
            data-qa="iframe" 
            style={{border: "0px"}}>
          </iframe>*/
        }

      </UserAutoMessageFlex>
    </UserAutoMessageStyledFrame>
  }
}

class MessageContainer extends Component {
  
  createMarkup =()=> { 
    return { __html:  this.props.availableMessage.html_content }; 
  };


  render(){
    return <Quest {...this.props}>
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



export default class Hermessenger {

  constructor(props){
    this.props = props
  }

  render(){
    //document.addEventListener('DOMContentLoaded', () => {
      var g = document.createElement('div');
      g.setAttribute("id", "hermessengerRoot");
      document.body.appendChild(g);

      ReactDOM.render(
        <Messenger {...this.props} />,
        document.getElementById("hermessengerRoot")
      ) 
    //})
  }
} 