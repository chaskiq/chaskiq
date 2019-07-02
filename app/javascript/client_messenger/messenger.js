/* eslint-disable no-unused-expressions */

import React, {Component, Fragment} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import actioncable from "actioncable"
import axios from "axios"

import UnicornEditor from './textEditor' // from './quillEditor' //'./draftEditor' //from './editor.js'
import gravatar from "gravatar"
import Moment from 'react-moment';
import { soundManager } from 'soundmanager2'
import Quest from './messageWindow'

import StyledFrame from 'react-styled-frame'
import styled, { ThemeProvider } from 'styled-components'
//import DanteContainer from './styles/dante'

import UrlPattern from 'url-pattern'

import theme from '../src/components/conversation/theme'
import themeDark from '../src/components/conversation/darkTheme'
import DraftRenderer from '../src/components/conversation/draftRenderer'
import DanteContainer from '../src/components/conversation/editorStyles'

//import CrossIcon from '@atlaskit/icon/glyph/cross';
//import Button from '@atlaskit/button';
import sanitizeHtml from 'sanitize-html';
import TourManager from './tourManager'
import {
  CloseIcon,
  LeftIcon,
  MessageIcon,
  } from './icons'

import {
  Container,
  UserAutoMessage,
  UserAutoMessageBlock,
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
    border: 0px;
    z-index: 1000;
    width: 350px;
    position: absolute;

    ${(props) => {
      return props.isMinimized ? `height: 73px;` : `height: 70vh;`
    }}

    ${(props)=>{
      return props.theme.isMessengerActive ? `
        bottom: 77px;
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

const UserAutoMessageFlex = styled(({ isMinimized, ...rest }) => (
  <div {...rest} />
))`
  display: flex;
  flex-direction: column;

  ${(props) => {
    return props.isMinimized ? `height: 70vh;` : `height: 92vh;`
  }}

  
  justify-content: space-between;
`

const MessageCloseBtn = styled.a`
    display: inline-block;
    padding: 4px;
    background: #737373;
    border-radius: 7px;
    font-size: .8em;
    -webkit-text-decoration: none;
    text-decoration: none;
    float: right;
    color: white;
    text-transform: uppercase;
`

const AppPackageBlockContainer = styled.div`
    border: 1px solid #ccc;
    padding: 1.2em;
    width: 100%;
    border-radius: 7px;
    background: #f5f2f2;

    input {
      padding: 1.2em;

    }
`


let App = {}


class Messenger extends Component {

  constructor(props){
    super(props)

    this.state = {
      conversation: {},
      conversation_messages: [],
      conversation_messagesMeta: {},
      conversations: [],
      conversationsMeta: {},
      availableMessages: [],
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
      properties: this.props.properties,
      session_id: this.props.session_id
    }

    if(this.props.encryptedMode){
      
      this.defaultHeaders = { 
        enc_data: this.props.encData,
        session_id: this.props.session_id
      }

      this.defaultCableData = { 
        app: this.props.app_id, 
        enc_data: this.props.encData,
        session_id: this.props.session_id
      }
    }

    this.axiosInstance = axios.create({
      baseURL: `${this.props.domain}`,
      headers: this.defaultHeaders
      /* other custom settings */
    });
    

    App = {
      cable: actioncable.createConsumer(`${this.props.ws}`)
    }

    this.overflow = null
    this.commentWrapperRef = React.createRef();

  }

  componentDidMount(){
    this.ping(()=> {
      this.precenseSubscriber()
      this.eventsSubscriber()
      this.getConversations()
      this.getMessage()
      this.locationChangeListener()
    })

    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps, prevState){
    /*if(prevState.display_mode !== this.state.display_mode && this.state.display_mode === "conversations")
      this.setState({ conversationsMeta: {} }, this.getConversations )
     

    if (prevState.open !== this.state.open && this.state.open && this.state.display_mode === "conversations")
      this.setState({ conversationsMeta: {} }, this.getConversations)
    */

    //if(this.state.conversation.id !== prevState.conversation.id)
      //this.conversationSubscriber()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  // todo: track pages here
  locationChangeListener = ()=>{
    /* These are the modifications: */
    history.pushState = ( f => function pushState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushState'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.pushState);

    history.replaceState = ( f => function replaceState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replaceState'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.replaceState);

    window.addEventListener('popstate',()=>{
        window.dispatchEvent(new Event('locationchange'))
    });

    window.addEventListener('locationchange', function(){
      alert('location changed!');
    })
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

  eventsSubscriber = ()=>{
    App.events = App.cable.subscriptions.create(this.cableDataFor({channel: "MessengerEventsChannel"}),
      {
        connected: ()=> {
          console.log("connected to events")
          this.processTriggers()
        },
        disconnected: ()=> {
          console.log("disconnected from events")
        },
        received: (data)=> {
          switch (data.type) {
            case "triggers:receive":
              return this.receiveTrigger(data.data)
            case "true":
              return true
            default:
              return 
          }


          console.log(`received event ${data}`)
        },
        notify: ()=>{
          console.log(`notify event!!`)
        },
        handleMessage: (message)=>{
          console.log(`handle event message`)
        } 
      }
    )
  }

  precenseSubscriber =()=>{
    App.precense = App.cable.subscriptions.create(this.cableDataFor({channel: "PresenceChannel"}),
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

  setOverflow = (el)=>{
    this.overflow = el
  }

  unsubscribeFromConversation = ()=>{
    if (App.conversations)
      App.conversations.unsubscribe()
      App.conversations = null
  }

  conversationSubscriber =(cb)=>{
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
            conversation_messages: [data].concat(this.state.conversation_messages)
          }, this.scrollToLastItem)
          
          if (data.app_user.kind != "app_user") {
            this.playSound()
          }
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
        this.setState({ availableMessages: response.data.collection })
        if (cb)
          cb(response.data.collection)
      })
      .catch((error) => {
        console.log(error);
      });

  }

  getMessage = (cb)=> {

    this.getAvailables((collection)=>{
 
    })

  }

  ping =(cb)=>{
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

  insertComment =(comment, cb)=>{
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

  createComment =(comment, cb)=>{
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

  createCommentOnNewConversation = (comment, cb)=>{
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

  clearAndGetConversations = ()=>{
    this.setState({ conversationsMeta: {} }, this.getConversations)
  }

  getConversations = (options)=>{

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    const nextPage = this.state.conversationsMeta.next_page || 1
    
    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/conversations.json?page=${nextPage}`)
      .then( (response)=> {
        const { collection, meta } = response.data
        this.setState({
          conversations: options && options.append ? this.state.conversations.concat(collection) : collection,
          conversationsMeta: meta
        })
        //cb ? cb() : null
      })
      .catch( (error)=>{
        console.log(error);
      });
  }

  setconversation = (id , cb)=>{
    const nextPage = this.state.conversation_messagesMeta.next_page || 1
    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/conversations/${id}.json?page=${nextPage}`)
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation,
          conversation_messages: nextPage > 1 ? this.state.conversation_messages.concat(response.data.messages) : response.data.messages ,
          conversation_messagesMeta: response.data.meta
        }, cb)
        
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  displayNewConversation =(e)=>{
    e.preventDefault()
    this.createCommentOnNewConversation(null, ()=>{

      this.conversationSubscriber(() => {

        //this.precenseSubscriber()
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

  displayConversationList = (e)=>{
    this.unsubscribeFromConversation()
    e.preventDefault()
    this.setState({
      display_mode: "conversations"
    })
  }

  displayConversation =(e, o)=>{

    this.unsubscribeFromConversation()

    this.setState({conversation_messagesMeta: {} }, ()=>{

      this.setconversation(o.id, () => {

        this.conversationSubscriber(() => {

          //this.precenseSubscriber()
          this.setState({
            display_mode: "conversation"
          }, () => {
            //this.conversationSubscriber() ; 
            //this.getConversations() ;
            this.scrollToLastItem()
          })

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
    return this.state.appData && this.state.appData.active_messenger == "on" || this.state.appData.active_messenger == "true" || this.state.appData.active_messenger === true
  }

  isTourManagerEnabled = ()=>{
    return window.opener && window.opener.TourManagerEnabled ? 
      window.opener.TourManagerEnabled() : null
  }

  receiveTrigger = (trigger)=>{
    setTimeout( ()=>{
      localStorage.setItem("chaskiq:trigger-"+trigger.id, 1)
      trigger.actions.map((o)=>{
        // open behavior
        o.open_messenger && !this.state.open ? 
        this.setState({open: true}) : null
      })
    }, trigger.after_delay*1000)
  }

  sendTrigger = ()=>{
    console.log("send trigger")
    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/triggers.json`)
    .then((response) => {
      console.log("trigger sent!")
      /*this.setState({
        messages: this.state.messages.concat(response.data.message)
      })*/

      /*if (cb)
        cb()*/
    })
    .catch((error) => {
      console.log(error);
    });
  }

  processTriggers = ()=>{
    this.state.appData.triggers.map((o)=>{
      this.processTrigger(o)
    })
  }

  processTrigger = (trigger)=>{
    if(localStorage.getItem("chaskiq:trigger-"+trigger.id)){
      console.log("skip trigger , stored")
      return
    } 
    
    if(!this.complyRules(trigger))
      return

    this.sendTrigger()
  }

  complyRules = (trigger)=>{
    const matches = trigger.rules.map((o)=>{
      var pattern = new UrlPattern(o.pages_pattern)
      return pattern.match(document.location.pathname);
    })

    return matches.indexOf(null) === -1
  }




  render(){
    return <ThemeProvider theme={{
                                  mode: this.state.appData ? this.state.appData.theme : 'light',
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
                                        <button onClick={() => this.toggleMessenger()}>
                                          <CloseIcon style={{ height: '16px', width: '16px'}}/>
                                        </button>

                                      </CloseButtonWrapper> : null
                                    }
                                    

                                    {/*this.props.app_id*/}
                                  </HeaderOption>
                                </Header>
                                <Body>

                                  {
                                    this.state.display_mode === "conversation" ?
                                    
                                      <Conversation
                                        isMobile={this.state.isMobile}
                                        conversation_messages={this.state.conversation_messages}
                                        conversation={this.state.conversation}
                                        conversation_messagesMeta={this.state.conversation_messagesMeta}
                                        isUserAutoMessage={this.isUserAutoMessage}
                                        insertComment={this.insertComment}
                                        setConversation={this.setconversation}
                                        setOverflow={this.setOverflow}

                                      /> : null
                                  } 

                                  {
                                    this.state.display_mode === "conversations" ? 
                                      <Conversations 
                                        isMobile={this.state.isMobile}
                                        displayConversation={this.displayConversation}
                                        displayNewConversation={this.displayNewConversation}
                                        conversationsMeta={this.state.conversationsMeta}
                                        conversations={this.state.conversations}
                                        getConversations={this.getConversations}
                                        clearAndGetConversations={this.clearAndGetConversations}
                                        email={this.props.email}
                                        app={this.state.appData}
                                      /> : null 
                                  }

                                </Body> 
                              </SuperFragment>
                            </SuperDuper> 
                          
                      </Container>  : null
              } 

              { 
                  this.state.appData && this.isMessengerActive() ?
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
                this.state.availableMessages.length > 0 ? 
                  <MessageFrame
                    appId={this.props.app_id}
                    getMessage={this.getMessage}
                    axiosInstance={this.axiosInstance}
                    availableMessages={this.state.availableMessages}
                    availableMessage={this.state.availableMessage}
                    {...this.props}
                    
                  /> : <div/>
              }


              {
                this.isTourManagerEnabled() ?
                  <TourManager/> : null 
              }
        
            </EditorWrapper>
          </ThemeProvider>
          }
}


class Conversation extends Component {



  // TODO: skip on xhr progress
  handleConversationScroll = (e) => {
    let element = e.target

    //console.log(element.scrollHeight - element.scrollTop, element.clientHeight) // on bottom
    if (element.scrollTop === 0) { // on top
    //if (element.scrollTop <= 50) { // on almost top // todo skip on xhr loading
      if (this.props.conversation_messagesMeta.next_page)
        this.props.setConversation(this.props.conversation.id)
    }
  }


  render(){
    return <div style={{
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0'
    }}>
      <div
        ref={comp => this.props.setOverflow(comp) }
        onScroll={this.handleConversationScroll}
        style={{ overflowY: 'auto', height: '100%' }}>

        <EditorSection>

          <CommentsWrapper
            isReverse={true}
            //ref={this.commentWrapperRef}
            isMobile={this.props.isMobile}>


            <div>
               <MessageItem>
                 <AppPackageBlock 
                   type={"ask_for_email"} 
                   schema={
                     [
                       {element: "input", type:"text", placeholder: "enter email", name: "email", label: "enter your email"},
                       {element: "separator"},
                       {element: "submit", label: "submit"}
                     ]
                   }
                 />
               </MessageItem>
            </div> 
            {
              this.props.conversation_messages.map((o, i) => {
                const userClass = o.app_user.kind === "agent" ? 'admin' : 'user'
                const isAgent = o.app_user.kind === "agent"
                const themeforMessage = o.private_note || isAgent ? theme : themeDark
                
                return <MessageItemWrapper
                  email={this.props.email}
                  key={o.id}
                  data={o}>
                  <MessageItem
                    className={userClass}
                    messageSourceType={o.message_source ? o.message_source.type : ''}>

                    <div className="message-content-wrapper">

                      {
                        this.props.isUserAutoMessage(o) ?
                          <UserAutoChatAvatar>
                            <img src={gravatar.url(o.app_user.email)} />
                            <span>{o.app_user.name || o.app_user.email}</span>
                          </UserAutoChatAvatar> : null
                      }


                       
                        {/*render light theme on user or private note*/}
                        
                        <ThemeProvider 
                          theme={ themeforMessage }>
                          <DanteContainer>
                            <DraftRenderer key={i} 
                              raw={JSON.parse(o.message.serialized_content)}
                            />
                          </DanteContainer>
                        </ThemeProvider>  
                      
                      {/*
                        <div
                        key={i}
                        className={this.props.isUserAutoMessage(o) ? '' : "text"}
                          dangerouslySetInnerHTML={
                            { __html: `<p>${o.message.html_content}</p>` }
                          }
                        />
                      */}

                      

                      {/*
                        <div
                          key={i}
                          className={this.props.isUserAutoMessage(o) ? '' : "text"}
                          dangerouslySetInnerHTML={
                            { __html: `<p>${o.message.html_content}</p>` }
                          }
                        />
                      */}

                    </div>

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
              insertComment={this.props.insertComment}
            />
          </Footer>

        </EditorSection>

      </div>
    </div>
  }

}


class Conversations extends Component {


  componentDidMount(){
    this.props.clearAndGetConversations()
  }

  // TODO: skip on xhr progress
  handleConversationsScroll = (e) => {
    let element = e.target

    //console.log(element.scrollHeight - element.scrollTop , element.clientHeight)
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.props.conversationsMeta.next_page)
        this.props.getConversations({ append: true })
    }
  }

  sanitizeMessageSummary = (message)=>{
    if(!message)
      return

    const sanitized = sanitizeHtml(message)
    return sanitized.length > 100 ? `${sanitized.substring(0, 100)} ...` : sanitized
  }

  render(){
    return <div style={{
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0'
    }}>
      <div onScroll={this.handleConversationsScroll}
        style={{ overflowY: 'auto', height: '100%' }}>
        <CommentsWrapper 
          isMobile={this.props.isMobile}>
          {
            this.props.conversations.map((o, i) => {

              const message = o.last_message

              return <CommentsItem key={o.id}
                onClick={(e) => { this.props.displayConversation(e, o) }}>

                {
                  message ?
                    <ConversationSummary>

                      <ConversationSummaryAvatar>
                        <img src={gravatar.url(message.app_user.email)} />
                      </ConversationSummaryAvatar>

                      <ConversationSummaryBody>

                        <ConversationSummaryBodyMeta>

                          {
                            !message.read_at && message.app_user.email !== this.props.email ?

                              <ReadIndicator /> : null
                          }
                          <Autor>
                            {message.app_user.email}
                          </Autor>

                          <Moment fromNow style={{
                            float: 'right',
                            color: '#ccc',
                            width: '88px',
                            margin: '0px 10px',
                            fontSize: '.8em',
                            textTransform: 'unset'
                          }}>
                            {message.created_at}
                          </Moment>

                        </ConversationSummaryBodyMeta>
                        {/* TODO: sanitize in backend */}
                        <ConversationSummaryBodyContent
                          dangerouslySetInnerHTML={
                            { __html: this.sanitizeMessageSummary(message.message.html_content) }
                          }
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
            {this.props.app.tagline}
            
          </Hint>

          <NewConvoBtn onClick={this.props.displayNewConversation}>
            create new conversation
          </NewConvoBtn>
        </ConversationsFooter>

      </div>
    </div>

  }
}

class MessageFrame extends Component {

  constructor(props){
    super(props)
    this.defaultMinized = false
    this.state = {
      isMinimized: this.fetchMinizedCache(),
      messages: []
    }
  }

  componentDidMount(){

    this.props.availableMessages.map((o) => {

      const firstKey = o.id

      const data = {
        referrer: window.location.path,
        email: this.props.email,
        properties: this.props.properties
      }

      this.props.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/messages/${firstKey}.json`)
        .then((response) => {
          this.setState({
            messages: this.state.messages.concat(response.data.message)
          })

          /*if (cb)
            cb()*/
        })
        .catch((error) => {
          console.log(error);
        });


    })

  }

  toggleMinimize = (e) => {
    const val = !this.state.isMinimized
    //console.log("toggle, ", val, "old ", this.state.isMinimized)
    this.cacheMinized(val)
    this.setState({ isMinimized: val })
  }

  messageCacheKey = (id) => {
    return `hermes-message-${id}`
  }

  cacheMinized = (val) => {
    const key = this.messageCacheKey(this.props.availableMessage.id)
    //console.log("minimize", key, val)
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
    const availableMessage = this.state.messages[0]
    const messageId = availableMessage.id
    const trackUrl = availableMessage.user_track_url
    const url = `/api/v1/apps/${appId}/messages/${messageId}/tracks/${trackUrl}/close.json`
    this.props.axiosInstance.get(url, {r: 'close'})
    .then((response) => {
      //console.log("handle close!!!")
      this.props.getMessage()
      //this.setState({ availableMessage: response.data.message })
    })
    .catch((error) => {
      console.log(error);
    });
  }

  handleMinus = (ev) => {
    ev.preventDefault()
    this.toggleMinimize(ev)
  }

  handleCloseClick = (ev) => {
    ev.preventDefault()
    this.handleClose(ev)
  }


  render(){
    return <UserAutoMessageStyledFrame id="messageFrame" 
      isMinimized={this.fetchMinizedCache()}>


       <UserAutoMessageFlex isMinimized={this.fetchMinizedCache()}>

        <UserAutoMessageBlock open={true}>
          <div className="close">
            {/* eslint-disable-next-line */}
            <MessageCloseBtn href="#" onClick={this.handleCloseClick}>
              dismiss
            </MessageCloseBtn>
          </div>
        </UserAutoMessageBlock>

        {
          this.state.messages.map((o, i) => {
            
            return <UserAutoMessage open={true} key={o.id}>
              <MessageContainer
                isMinimized={this.state.isMinimized}
                toggleMinimize={this.toggleMinimize}
                handleClose={this.handleClose}
                availableMessage={o}
              />
            </UserAutoMessage>

            {
              /*
              <iframe frameborder="0" height="100%"
                src="https://prey.typeform.com/to/TxwKrk?typeform-embed=embed-widget&amp;typeform-embed-id=atsi1" 
                width="100%"
                data-qa="iframe" 
                style={{border: "0px"}}>
              </iframe>
              */
            }

          })

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
    // mark as read on first render it not read & from admin
    if(!this.props.data.read_at && this.props.data.app_user.kind != "app_user"){
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

class AppPackageBlock extends Component {

  renderElements = ()=>{
    return this.props.schema.map((o)=>
      this.renderElement(o)
    )
  }

  renderElement = (item)=>{
    const element = item.element

    switch(item.element){
    case "separator":
      return <hr/>
    case "input":
      return <div>
              {item.label ? <label>{item.label}</label> : null }
              <input 
                type={element.type} 
                placeholder={element.placeholder}
              />
             </div>

    case "submit":
      return <button type={"submit"}></button>
    default:
      return null
    }
  }

  render(){
    return <div>
              <AppPackageBlockContainer>
                {
                  this.renderElements()
                }
              </AppPackageBlockContainer>
            </div>
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