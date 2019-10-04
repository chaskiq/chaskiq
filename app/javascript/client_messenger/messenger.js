import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
//import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'
import actioncable from "actioncable"
import axios from "axios"
import UAParser from 'ua-parser-js'
import theme from './textEditor/theme'
import themeDark from './textEditor/darkTheme'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import UnicornEditor from './textEditor' // from './quillEditor' //'./draftEditor' //from './editor.js'
import Tour from './UserTour'
import gravatar from "./shared/gravatar"
import Moment from 'react-moment';
import { soundManager } from 'soundmanager2'
import {toCamelCase} from './shared/caseConverter'
import UrlPattern from 'url-pattern'
import serialize from 'form-serialize'
import { withTranslation } from 'react-i18next';
import i18n from './i18n'
import {
  PING, 
  CONVERSATIONS, 
  CONVERSATION,
  INSERT_COMMMENT,
  START_CONVERSATION
} from './graphql/queries'
import GraphqlClient from './graphql/client'

//import {
//  INSERT_COMMMENT,
//  START_CONVERSATION
//} from '../mutations'

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
  HeaderTitle,
  ChatAvatar,
  UserAutoChatAvatar,
  NewConvoBtn,
  ConversationSummary,
  ConversationSummaryAvatar,
  ConversationSummaryBody,
  ConversationSummaryBodyMeta,
  ConversationSummaryBodyContent,
  ConversationSummaryBodyItems,
  Autor,
  Hint,
  ConversationsFooter,
  SuperDuper,
  UserAutoMessageStyledFrame,
  CloseButtonWrapper,
  SuperFragment,
  MessageSpinner,
  UserAutoMessageFlex,
  MessageCloseBtn,
  AppPackageBlockContainer,
  HeaderAvatar
} from './styles/styled'

import sanitizeHtml from 'sanitize-html';
import TourManager from './tourManager'
import {
  CloseIcon,
  LeftIcon,
  MessageIcon,
  } from './icons'
import Quest from './messageWindow'
import StyledFrame from './styledFrame'

import Home from './homePanel'
import Article from './articles'

let App = {}



class Messenger extends Component {

  constructor(props){
    super(props)

    // set language from user auth lang props 
    i18n.changeLanguage(this.props.lang);

    this.state = {
      enabled: null,
      article: null,
      conversation: {},
      conversation_messages: [],
      conversation_messagesMeta: {},
      conversations: [],
      conversationsMeta: {},
      availableMessages: [],
      availableMessage: null,
      display_mode: "home", // "conversation", "conversations",
      tours: [],
      open: false,
      appData: {},
      agents: [],
      isMinimized: false,
      isMobile: false,
      tourManagerEnabled: false,
      currentAppBlock: {},
      ev: null,
      header:{
        opacity: 1,
        translateY: 0,
        height: 212
      },
      transition: 'in'
    }

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    this.defaultHeaders = {
      app: this.props.app_id,
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
        app: this.props.app_id,
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

    //this.graphqlClient = this.props.graphqlClient
    /*new GraphqlClient({
      config: this.defaultHeaders,
      baseURL: '/api/graphql'
    })*/

    this.graphqlClient = new GraphqlClient({
      config: this.defaultHeaders,
      baseURL: `${this.props.domain}/api/graphql`
    })

    App = {
      cable: actioncable.createConsumer(`${this.props.ws}`)
    }

    this.overflow = null
    this.commentWrapperRef = React.createRef();

  }

  componentDidMount(){

    //this.eventsSubscriber()
    
    this.ping(()=> {
      this.precenseSubscriber()
      this.eventsSubscriber()
      //this.getConversations()
      //this.getMessage()
      //this.getTours()
      this.locationChangeListener()
    })

    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions);

    window.addEventListener('message', (e)=> {
      if(e.data.tourManagerEnabled){
        console.log("EVENTO TOUR!", e)
        this.setState({
          tourManagerEnabled: e.data.tourManagerEnabled, 
          ev: e
        })
      }
    } , false);

    window.opener && window.opener.postMessage({type: "ENABLE_MANAGER_TOUR"}, "*");
    
  }

  componentDidUpdate(prevProps, prevState){
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  // todo: track pages here
  locationChangeListener = ()=>{
    /* These are the modifications: */
    window.history.pushState = ( f => function pushState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushState'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(window.history.pushState);

    window.history.replaceState = ( f => function replaceState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replaceState'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(window.history.replaceState);

    window.addEventListener('popstate',()=>{
        window.dispatchEvent(new Event('locationchange'))
    });

    window.addEventListener('locationchange', ()=>{
      this.registerVisit()
    })
  }

  registerVisit = ()=>{
    const parser = new UAParser();

    const results = parser.getResult()
  
    const data = {
      title: document.title,
      url: document.location.href,
      browser_version: results.browser.version,
      browser_name: results.browser.name,
      os_version: results.os.version,
      os: results.os.name
    }
    App.events.perform('send_message', data)
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
      url: `${this.props.domain}/sounds/pling.mp3`,
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
          this.registerVisit()
          //this.processTriggers()
        },
        disconnected: ()=> {
          console.log("disconnected from events")
        },
        received: (data)=> {
          switch (data.type) {
            case "messages:receive":
              this.setState({
                availableMessages: data.data, 
                messages: data.data, 
                availableMessage: data.data[0]
              })
              break
            case "tours:receive":
              this.receiveTours(data.data)
              break
            case "triggers:receive":
              this.receiveTrigger(data.data)
              break
            case "conversations:conversation_part":
              const newMessage = toCamelCase(data.data)
              this.receiveMessage(newMessage)
              break
            case "true":
              return true
            default:
              return 
          }


          console.log(`received event`, data)
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

  receiveMessage = (newMessage)=>{

    if(newMessage.conversationId != this.state.conversation.id) return

    if ( this.state.conversation_messages.find( (o)=> o.id === newMessage.id ) ){
      const new_collection = this.state.conversation_messages.map((o)=>{
          if (o.id === newMessage.id ){
            return newMessage
          } else {
            return o
          }
      })

      this.setState({
        conversation_messages: new_collection
      })

    } else {
      this.setState({
        conversation_messages: [newMessage].concat(this.state.conversation_messages)
      }, this.scrollToLastItem)
      
      if (newMessage.appUser.kind === "agent") {
        this.playSound()
      }
    }

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

  ping =(cb)=>{

    this.graphqlClient.send(PING, {}, {
      success: (data)=>{
        this.setState({
          appData: data.messenger.app,
          agents: data.messenger.agents,
          enabled: data.messenger.enabledForUser
        }, ()=>{
          console.log("subscribe to events")
          cb()
        })
      },
      error: ()=>{

      }
    })
  }

  insertComment =(comment, cb)=>{
    if(this.state.conversation.key && this.state.conversation.key != 'volatile'){
      this.createComment(comment, cb)
    }else{
      this.createCommentOnNewConversation(comment, cb)
    }
  }

  createComment =(comment, cb)=>{
    const id = this.state.conversation.key

    const message = {
      html: comment.html_content,
      serialized: comment.serialized_content
    }

    // force an assigment from client
    //if( this.state.conversation_messages.length === 0)
    //  opts['check_assignment_rules'] = true

    this.graphqlClient.send(INSERT_COMMMENT, {
      appKey: this.props.app_id,
      id: id,
      message: message
    }, {
      success: (data)=>{
        cb(data)
      },
      error: ()=>{

      }
    })
  }

  createCommentOnNewConversation = (comment, cb)=>{

    const message = {
      html: comment.html_content,
      serialized: comment.serialized_content,
      volatile: this.state.conversation,
    }

    this.graphqlClient.send( START_CONVERSATION, {
      appKey: this.props.app_id,
      message: message
    }, { 
      success: (data)=>{
        const {conversation} = data.startConversation
        let messages = [conversation.lastMessage]
        if(this.state.display_mode === "conversation")
          messages = messages.concat(this.state.conversation_messages)

        this.setState({
          conversation: conversation,
          conversation_messages: messages
            /*conversation.lastMessage ? 
            response.data.messages.concat(this.state.conversation_messages) : 
            this.state.conversation_messages*/
          }, ()=>{ 
            this.handleTriggerrequest("infer")
          cb && cb()
        })
      },
      error: ()=> {
        debugger
      }
    })
   }

  handleTriggerrequest = (trigger)=>{
    if (this.state.appData.tasksSettings){
      setTimeout(()=>{
        this.requestTrigger(trigger)
      }, 0 ) // 1000 * 60 * 2
    }
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

    this.graphqlClient.send(CONVERSATIONS, {
      page: nextPage
    }, {
      success: (data)=>{
        const { collection, meta } = data.messenger.conversations
        this.setState({
          conversations: options && options.append ? this.state.conversations.concat(collection) : collection,
          conversationsMeta: meta
        })
      },
      error: ()=>{

      }
    })
  }

  setconversation = (id , cb)=>{
    const nextPage = this.state.conversation_messagesMeta.next_page || 1
    this.graphqlClient.send(CONVERSATION, {
      id: id,
      page: nextPage
    }, {
      success: (data)=>{
        const {conversation} = data.messenger
        const {messages, meta} = conversation
        this.setState({
          conversation: conversation,
          conversation_messages: nextPage > 1 ? this.state.conversation_messages.concat(messages.collection) : messages.collection ,
          conversation_messagesMeta: messages.meta
        }, cb)
      },
      error: (error)=>{
        debugger
      }
    })
  }

  setTransition = (type, cb)=>{
    this.setState({
      transition: type
    }, ()=>{
      setTimeout(()=>{
        cb()
      }, 200)
    })
  }

  displayNewConversation =(e)=>{
    e.preventDefault()

    this.setState({
      conversation_messages: [],
      conversation_messagesMeta: {},
      conversation: {
        key: "volatile",
        mainParticipant: {}
      },
      display_mode: "conversation"
    }, ()=>{
      // this.requestTrigger("infer")
    })

    /*if(this.state.appData.userTasksSettings && this.state.appData.userTasksSettings.share_typical_time && this.props.kind === "AppUser" )
      this.requestTrigger("typical_reply_time")

    if(this.state.appData.leadTasksSettings && this.state.appData.leadTasksSettings.share_typical_time && this.props.kind === "Lead" )
      this.requestTrigger("typical_reply_time")

    if( this.state.appData.emailRequirement === "Always" && this.props.kind === "Lead")
      return this.requestTrigger("request_for_email")

    if( this.state.appData.emailRequirement === "office" && !this.state.appData.inBusinessHours)
      return this.requestTrigger("request_for_email")*/

  }

  displayHome = (e)=>{
    //this.unsubscribeFromConversation()
    e.preventDefault()

    this.setTransition('out', ()=>{
      this.setDisplayMode('home')
    })
  }

  displayArticle = (e, article)=>{
    e.preventDefault()
    this.setTransition('out', ()=>{
      this.setState({
        article: article
      }, ()=> this.setDisplayMode('article') )
    })
  }

  setDisplayMode = (section, cb=null)=>{
    this.setState({
      transition: 'in'
    }, ()=>{
      this.setState({
        display_mode: section,
      }, ()=>{
        cb && cb()
      })
    })
  }

  displayConversationList = (e)=>{
    //this.unsubscribeFromConversation()
    e.preventDefault()

    this.setTransition('out', ()=>{
      this.setDisplayMode('conversations')
    })

  }

  displayConversation =(e, o)=>{

    //this.unsubscribeFromConversation()

    this.setState({conversation_messagesMeta: {} }, ()=>{

      this.setconversation(o.key, () => {

        //this.conversationSubscriber(() => {

          this.setTransition('out', ()=>{

            //this.precenseSubscriber()

            this.setDisplayMode('conversation', ()=>{
              //this.conversationSubscriber() ; 
              //this.getConversations() ;
              this.scrollToLastItem()
            })
          })

        //})
      })
    })
  }

  toggleMessenger = (e)=>{
    this.setState({
      open: !this.state.open, 
      //display_mode: "conversations",
    })
  }

  isUserAutoMessage = (o)=>{
    return o.message_source && o.message_source.type === "UserAutoMessage"
  }

  isMessengerActive = ()=>{
    return !this.state.tourManagerEnabled && this.state.enabled && this.state.appData && (this.state.appData.activeMessenger == "on" || this.state.appData.activeMessenger == "true" || this.state.appData.activeMessenger === true)
    //return this.state.appData && this.state.appData.inboundSettings && this.state.appData.inboundSettings.enabled
  }

  isTourManagerEnabled = ()=>{
    return true
    /*return window.opener && window.opener.TourManagerEnabled ? 
      window.opener.TourManagerEnabled() : null*/
  }

  /*
  appendDelayed = (steps)=>{
    //const o = steps.pop()
    const newSteps = [...steps]
    const o = newSteps.pop()
    //console.log(o, steps)
    if(!o) return

    const trigger = this.state.conversation.trigger

    const conversation = {
      assignee: null,
      trigger: trigger,
      currentStep: o,
      locked: o.controls && (o.controls.type === "ask_option" || o.controls.type === "data_retrieval"),
      mainParticipant: {
        //display_name: "visitor 8 ",
        //email: null,
        //id: 10,
        //kind: "lead" 
      }
    }

    // messages & controles will never meet together

    const conversationMessages = o.messages.map((message)=>(
      {
        volatile: true,
        appUser: message.app_user,
        message: {
          serializedContent: message.serialized_content
        }
      }
    )).reverse()
    
    const newMessages = [o.controls].concat(conversationMessages)

    this.setState({
      conversation: conversation,
      conversation_messages:  newMessages
                              .filter((o)=> o)
                              .concat(this.state.conversation_messages)
                              .filter((o)=> !o.draft)
                              ,
      conversation_messagesMeta: {},
      display_mode: "conversation",
    }, ()=>{
      this.scrollToLastItem()

      setTimeout(()=> {
        if(o.controls) return

        if(newSteps.length > 0) this.appendDraftMessage()

        setTimeout(()=> {
          this.appendDelayed(newSteps)
        }, 1000)

      })
      
    })
    
  }
  */

  appendDraftMessage = (cb)=>{
    const newMessage = {
      draft: true
    }

    this.setState({
      conversation_messages:  [newMessage]
                              .concat(this.state.conversation_messages),
      conversation_messagesMeta: {},
      display_mode: "conversation",
    }, ()=>{

      this.scrollToLastItem()
      cb && cb()
    })
  }

  requestTrigger = (kind)=>{
    App.events && App.events.perform('request_trigger', {
      conversation: this.state.conversation && this.state.conversation.key,
      trigger: kind
    })
  }

  receiveTrigger = (data)=>{ 
    this.requestTrigger(data.trigger.id)
  }

  /*sendTrigger = ()=>{
    console.log("send trigger")
    this.axiosInstance.get(`/api/v1/apps/${this.props.app_id}/triggers.json`)
    .then((response) => {
      console.log("trigger sent!")
      //this.setState({
      //  messages: this.state.messages.concat(response.data.message)
      //})

      //if (cb)
      //  cb()
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
  }*/

  // check url pattern before trigger tours
  receiveTours = (tours)=>{
    const filteredTours = tours.filter((o)=>{
      var pattern = new UrlPattern(o.url.replace(/^.*\/\/[^\/]+/, ''))
      var url = document.location.pathname
      return pattern.match(url);
    })

    if(filteredTours.length > 0) this.setState({tours: filteredTours})
  }

  submitAppUserData = (data, next_step)=>{
    App.events && App.events.perform('data_submit', data)
  }

  updateHeaderOpacity = (val)=>{
    this.setState({
      headerOpacity: val
    })
  }

  updateHeaderTranslateY = (val)=>{
    this.setState({
      headerTranslateY: val
    })
  }

  updateHeader = ({translateY, opacity, height})=>{
    this.setState({
      header: Object.assign({}, this.state.header, {translateY, opacity, height} )
    }) 
  }

  renderAsignee = ()=>{
    const {assignee} =  this.state.conversation
    if(assignee){
      return <HeaderAvatar>
              <img src={gravatar(assignee.email)} />
              <div>
                <p>{assignee.name}</p>
                <span>away</span>
              </div>
             </HeaderAvatar>
    }else{
      return <HeaderAvatar>
              
              <img src={gravatar('bot@chaskiq.io')} />

              <div>
                <p>chaskiq bot</p>
              </div>

             </HeaderAvatar>
    }
  }

  displayAppBlockFrame = (message)=>{
    this.setState({
      display_mode: "appBlockAppPackage",
      currentAppBlock: {
        message: message
      }
    })
  }

  handleAppPackageEvent = (ev)=>{
    console.log("data", ev.data)
    console.log(this.state)

    App.events && App.events.perform('app_package_submit', {
      conversation_id: this.state.conversation.key,
      message_id: this.state.currentAppBlock.message.id,
      data: ev.data
    })

    this.setState({
      currentAppBlock: {}, 
      display_mode: "conversation"
    })
  }

  render() {
    return (

      <ThemeProvider theme={{
        mode: this.state.appData ? this.state.appData.theme : 'light',
        isMessengerActive: this.isMessengerActive()
      }}>
      
        <EditorWrapper>

          {
            this.state.availableMessages.length > 0 && this.isMessengerActive() ?
            <MessageFrame 
              app_id={this.props.app_id}
              axiosInstance={this.axiosInstance}
              availableMessages={this.state.availableMessages} 
              t={this.props.t}
            /> : null
          }
              

          {
            this.state.open && this.isMessengerActive() ?
              <Container 
                open={this.state.open} 
                isMobile={this.state.isMobile}>
                
                <SuperDuper> 
                  <StyledFrame style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}>

                    <FrameBridge 
                      handleAppPackageEvent={this.handleAppPackageEvent}>

                      <SuperFragment>
                        <Header 
                          style={{height: this.state.header.height}}
                          isMobile={this.state.isMobile}>
                          <HeaderOption 
                            in={this.state.transition}
                            >

                            { this.state.display_mode != "home" ? 
                              <LeftIcon 
                                className="fade-in-right"
                                onClick={this.displayHome.bind(this)}
                                ///onClick={this.displayConversationList.bind(this)}
                                style={{margin: '20px', cursor: 'pointer'}}
                              /> : null 
                            }

                            { this.state.display_mode === "conversation" &&
                              <HeaderTitle in={this.state.transition}>
                                {this.renderAsignee()}
                              </HeaderTitle>
                            }

                            { this.state.display_mode === "home" &&
                              <HeaderTitle style={{
                                padding: '2em',
                                opacity: this.state.header.opacity,
                                transform: `translateY(${this.state.header.translateY}px)`
                              }}>
                                <h2>{this.state.appData.greetings}</h2>
                                <p>{this.state.appData.intro}</p>
                              </HeaderTitle>
                            }


                            { this.state.display_mode === "conversations" &&
                              <HeaderTitle in={this.state.transition}>
                                {this.props.t("conversations")}
                              </HeaderTitle>
                            }

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
                            this.state.display_mode === "home" && 
                            <Home 
                              graphqlClient={this.graphqlClient}
                              displayNewConversation={this.displayNewConversation}
                              viewConversations={this.displayConversationList}
                              updateHeader={this.updateHeader}
                              transition={this.state.transition}
                              displayArticle={this.displayArticle}
                              appData={this.state.appData}
                              agents={this.state.agents}
                              {...this.props}
                              t={this.props.t}
                            />
                          }

                          {
                            this.state.display_mode === "article" &&
                            <Article 
                              graphqlClient={this.graphqlClient}
                              updateHeader={this.updateHeader}
                              transition={this.state.transition}
                              articleSlug={this.state.article.slug}
                              transition={this.state.transition}
                              appData={this.state.appData}
                              t={this.props.t}
                            />
                          }

                          {
                            this.state.display_mode === "conversation" &&
                            
                              <Conversation
                                isMobile={this.state.isMobile}
                                conversation_messages={this.state.conversation_messages}
                                conversation={this.state.conversation}
                                conversation_messagesMeta={this.state.conversation_messagesMeta}
                                isUserAutoMessage={this.isUserAutoMessage}
                                insertComment={this.insertComment}
                                setConversation={this.setconversation}
                                setOverflow={this.setOverflow}
                                submitAppUserData={this.submitAppUserData}
                                updateHeader={this.updateHeader}
                                transition={this.state.transition}
                                displayAppBlockFrame={this.displayAppBlockFrame}
                                t={this.props.t}
                              /> 
                          } 

                          {
                            this.state.display_mode === "conversations" && 
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
                                updateHeader={this.updateHeader}
                                transition={this.state.transition}
                                t={this.props.t}
                              />
                          }

                          {
                            this.state.display_mode === "appBlockAppPackage" &&
                            <AppBlockPackageFrame 
                              domain={this.props.domain}
                              appBlock={this.state.currentAppBlock}
                            />
                          }

                        </Body> 
                        
                      </SuperFragment>
                    </FrameBridge>
                  </StyledFrame>

                </SuperDuper> 
              
              </Container>  : null
          }


          { 
            this.isMessengerActive() ?
            <StyledFrame style={{
                zIndex: '10000000',
                position: 'absolute',
                bottom: '-14px',
                width: '88px',
                height: '100px',
                right: '-9px',
                border: 'none'
              }}>

              <Prime id="chaskiq-prime" onClick={this.toggleMessenger}>
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
          this.state.tourManagerEnabled ?
          <TourManager ev={this.state.ev}/> : 
            this.state.tours.length > 0 ? 
            <Tour 
              tours={this.state.tours}
              events={App.events}
            /> : null
        }

        <div id="TourManager"></div>

        </EditorWrapper>
        
      </ThemeProvider>
    );
  }
}

// frame internals grab
class FrameBridge extends Component {
  constructor(props){
    super(props)

    props.window.addEventListener('message', (e)=> {
      props.handleAppPackageEvent(e)
    } , false);
  }
  
  render(){
    return <React.Fragment>
            {this.props.children}
           </React.Fragment>
  }
}

class AppBlockPackageFrame extends Component {

  componentDidMount(){
  }

  render(){
    const blocks = toCamelCase(this.props.appBlock.message.message.blocks)
 
    const url = `${this.props.domain}/package_iframe/${blocks.appPackage}`
    let src = new URL(url)
    //Object.keys(blocks.values, (k)=>{
    //  src.searchParams.set(k, encodeURIComponent( blocks.values[k] ))
    //})
    //'https://admin.typeform.com/to/cVa5IG');

    src.searchParams.set("url", blocks.values.src )
    
    return <div>
              <iframe src={src.href} 
                style={{
                  width: '100%',
                  height: '100vh',
                  border: '0px'
                }} 
              />
           </div>
  }
}

class Conversation extends Component {

  componentDidMount(){
    this.props.updateHeader(
      {
        translateY: 0 , 
        opacity: 1, 
        height: '0' 
      }
    )
  }

  // TODO: skip on xhr progress
  handleConversationScroll = (e) => {
    let element = e.target
    //console.log(element.scrollTop)
    //console.log(element.scrollHeight - element.scrollTop, element.clientHeight) // on bottom
    if (element.scrollTop === 0) { // on top

      this.props.updateHeader(
        {
          translateY: 0 , 
          opacity: 1, 
          height: 212
        }
      )

    //if (element.scrollTop <= 50) { // on almost top // todo skip on xhr loading
      if (this.props.conversation_messagesMeta.next_page)
        this.props.setConversation(this.props.conversation.key)
    } else {
      this.props.updateHeader(
        {
          translateY: 0 , 
          opacity: 1, 
          height: 0
        }
      )
    }
  }

  renderDraft = ()=>{
    return <MessageItem>

            <div className="message-content-wrapper">
              <MessageSpinner>
                <div className={"bounce1"}/>
                <div className={"bounce2"}/>
                <div className={"bounce3"}/>
              </MessageSpinner>
            </div>

           </MessageItem>
  }

  renderMessage = (o, i)=>{
    const userClass = o.appUser.kind === "agent" ? 'admin' : 'user'
    const isAgent = o.appUser.kind === "agent"
    const themeforMessage = o.privateNote || isAgent ? theme : themeDark
    const {t} = this.props
    
    return <MessageItemWrapper
            email={this.props.email}
            key={o.id}
            conversation={this.props.conversation}
            data={o}>

            <MessageItem
              className={userClass}
              messageSourceType={o.messageSource ? o.messageSource.type : ''}
            >

            {
              !this.props.isUserAutoMessage(o) && isAgent ?
              <ConversationSummaryAvatar>
                <img src={gravatar(o.appUser.email)} />
              </ConversationSummaryAvatar> : null
            }

            <div className="message-content-wrapper">

              {
                this.props.isUserAutoMessage(o) ?
                  <UserAutoChatAvatar>
                    <img src={gravatar(o.appUser.email)} />
                    <span>{o.appUser.name || o.appUser.email}</span>
                  </UserAutoChatAvatar> : null
              }

              {/*render light theme on user or private note*/}
              
              <ThemeProvider 
                theme={ themeforMessage }>
                <DanteContainer>
                  <DraftRenderer 
                    key={i}
                    message={o}
                    raw={JSON.parse(o.message.serializedContent)}
                  />
                </DanteContainer>
              </ThemeProvider>  

            </div>

            <span className="status">
              {
                o.readAt ?
                  <Moment fromNow>
                    {o.readAt}
                  </Moment> : <span>{t("not_seen")}</span>
              }
            </span>

            </MessageItem>
            
          </MessageItemWrapper>
  }

  renderItemPackage = (o, i)=>{
    return  <AppPackageBlock 
               key={i}
               message={o}
               conversation={this.props.conversation}
               submitAppUserData={this.props.submitAppUserData.bind(this)}
               clickHandler={this.appPackageClickHandler.bind(this)}
               appPackageSubmitHandler={this.appPackageSubmitHandler.bind(this)}
               {...o}
              />
  }

  appPackageBlockDisplay = (message)=>{
    this.props.displayAppBlockFrame(message)
  }

  appPackageClickHandler = (item, message)=>{
    // run app block display here! refactor
    if (message.message.blocks.type === "app_package") return this.appPackageBlockDisplay(message)
    
    App.events && App.events.perform('trigger_step', {
      conversation_id: this.props.conversation.key,
      message_id: message.id,
      trigger: message.triggerId,
      step: item.nextStepUuid || item.next_step_uuid,
      reply: item
    })
    
  }

  appPackageSubmitHandler = (data, message)=>{
    App.events && App.events.perform("receive_conversation_part", 
      {
        conversation_id: this.props.conversation.key,
        message_id: message.id,
        step: this.props.stepId,
        trigger: this.props.TriggerId,
        submit: data
      })
  }

  render(){

    const {t} = this.props
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

            {
              this.props.conversation_messages.map((o, i) => {
                  return o.message.blocks ? 
                  this.renderItemPackage(o, i) : 
                  o.draft ? this.renderDraft() : this.renderMessage(o, i)
              })
            }

          </CommentsWrapper>

          <Footer>
          
            {
              this.props.conversation.locked ? t("reply_above") : 
              <UnicornEditor
                insertComment={this.props.insertComment}
              />
            }
            
          </Footer>

        </EditorSection>

      </div>
    </div>
  }

}

class Conversations extends Component {

  componentDidMount(){
    this.props.clearAndGetConversations()

    this.props.updateHeader(
      {
        translateY: 0 , 
        opacity: 1, 
        height: '0' 
      }
    )
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
    const {t} = this.props

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

              const message = o.lastMessage

              return <CommentsItemComp
                message={message}
                o={o}
                index={i}
                t={t}
                displayConversation={this.props.displayConversation}
                sanitizeMessageSummary={this.sanitizeMessageSummary}
              />


            })
          }
        </CommentsWrapper>

        <ConversationsFooter>
          <Hint>
            {this.props.app.tagline}
          </Hint>

          {
            this.props.app.inboundSettings.enabled &&
            <NewConvoBtn
              in={this.props.transition}
              onClick={this.props.displayNewConversation}>
              {t("create_new_conversation")}
            </NewConvoBtn> 
          }
        </ConversationsFooter>

      </div>
    </div>

  }
}

function CommentsItemComp(props){

  const {
    displayConversation, 
    message, 
    o, 
    sanitizeMessageSummary,
    email,
    index,
    t
  } = props

  const [display, setDisplay] = React.useState(false)

  React.useEffect(() => {
    setTimeout(()=> setDisplay(true), 400 ) // + (index * 100))
  }, [])

  return <CommentsItem
                display={display}
                key={o.id}
                onClick={(e) => { displayConversation(e, o) }}>

                {
                  message ?
                    <ConversationSummary>

                      <ConversationSummaryAvatar>
                        {
                          o.assignee && <img src={gravatar(o.assignee.email)} />
                        }
                        
                      </ConversationSummaryAvatar>

                      <ConversationSummaryBody>

                        <ConversationSummaryBodyMeta>
                          {
                            !message.readAt && message.appUser.email !== email ?
                              <ReadIndicator /> : null
                          }
                          <Autor>
                            {o.assignee && o.assignee.displayName}
                          </Autor>

                          <Moment fromNow style={{
                            float: 'right',
                            color: '#ccc',
                            width: '115px',
                            margin: '0px 10px',
                            fontSize: '.8em',
                            textTransform: 'unset',
                            textAlign: 'right',
                            fontWeight: '100' 
                          }}>
                            {message.createdAt}
                          </Moment>

                        </ConversationSummaryBodyMeta>
                        {/* TODO: sanitize in backend */}
                        {/*<img src={gravatar(message.appUser.email)} />*/}
                        <ConversationSummaryBodyItems>
                          {
                            message.appUser.kind != "agent" ? 
                              <div className="you">{t("you")}:</div> : null 
                          }
                          <ConversationSummaryBodyContent
                            dangerouslySetInnerHTML={
                              { __html: sanitizeMessageSummary(message.message.htmlContent) }
                            }
                          />
                        </ConversationSummaryBodyItems>

                      </ConversationSummaryBody>
                    </ConversationSummary> : null
                }
              </CommentsItem>
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

  handleClose = (message)=>{
    App.events && App.events.perform("track_close", 
      {campaign_id: message.id}   
    )
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
    return <UserAutoMessageStyledFrame 
            id="messageFrame" 
            isMinimized={this.fetchMinizedCache()}>
      
       <UserAutoMessageFlex isMinimized={this.fetchMinizedCache()}>

        {
          this.props.availableMessages.map((o, i) => {
            
            return <UserAutoMessage 
                    open={true} 
                    key={`user-auto-message-${o.id}`}>
                    <MessageContainer
                      isMinimized={this.state.isMinimized}
                      toggleMinimize={this.toggleMinimize}
                      handleClose={this.handleClose}
                      availableMessage={o}
                      t={this.props.t}
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
  
  componentDidMount(){
    App.events && App.events.perform("track_open", 
      {campaign_id: this.props.availableMessage.id}   
    )
  }


  render(){
    const {t} = this.props
    const editorTheme = theme

    return <Quest {...this.props}>
              
              <MessageCloseBtn href="#" 
                onClick={()=> this.props.handleClose(this.props.availableMessage)}>
                {t("dismiss")}
              </MessageCloseBtn>

              <ThemeProvider 
                theme={ editorTheme }>
                <DanteContainer>
                  <DraftRenderer
                    raw={JSON.parse(this.props.availableMessage.serialized_content)}
                  />
                </DanteContainer>
              </ThemeProvider>  
           </Quest>
  }
}

class MessageItemWrapper extends Component {
  componentDidMount(){
    // mark as read on first render if not read & from admin
    if(!this.props.data.volatile && !this.props.data.readAt && this.props.data.appUser.kind === "agent"){
      App.events && App.events.perform("receive_conversation_part", 
        Object.assign({}, {
          conversation_id: this.props.conversation.key,
          message_id: this.props.data.id,
          step: this.props.stepId,
          trigger: this.props.TriggerId
        }, {email: this.props.email})
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

  form = null

  state = {
    value: null
  }

  renderElements = ()=>{
    const isDisabled = this.props.message.state === "replied"
    if(isDisabled) return this.renderDisabledElement() 
    return this.props.message.blocks.schema.map((o, i)=>
       this.renderElement(o, i)
    )
  }

  handleStepControlClick = (item)=>{
    this.props.clickHandler(item, this.props)
  }

  sendAppPackageSubmit = (e)=>{
    e.preventDefault()
    const data = serialize(e.currentTarget, { hash: true, empty: true })
 
    this.props.appPackageSubmitHandler(data, this.props)
  }

  renderEmptyItem = ()=>{
    if(this.props.message.blocks.type === "app_package"){
      return <p>{this.props.message.blocks.app_package} replied</p>

    }else{
      return <p>mo</p>
    }
  }

  renderDisabledElement = ()=>{
    const item = this.props.message.data

    if(!item) return this.renderEmptyItem()
    
    switch(item.element){
      case "button":
        return <p>{item.label}</p>
      default:
        if (this.props.message.blocks.type === "data_retrieval"){
          return Object.keys(this.props.message.data).map((k)=>{
            return <p>{k}: {this.props.message.data[k]}</p>
          })
        } else{
          <p>{JSON.stringify(this.props.message.data)}</p>
        }
    }
  }

  renderElement = (item, index)=>{
    const element = item.element
    const isDisabled = this.props.message.state === "replied"

    switch(item.element){
    case "separator":
      return <hr key={index}/>
    case "input":
      return <div className={"form-group"} key={index}>
              {item.label ? <label>{item.label}</label> : null }
              <input 
                disabled={isDisabled}
                type={item.type} 
                name={item.name}
                placeholder={item.placeholder}
                //onKeyDown={(e)=>{ e.keyCode === 13 ? 
                //  this.handleStepControlClick(item) : null
                //}}
              />
              <button disabled={isDisabled}
                      key={index} 
                      style={{alignSelf: 'flex-end'}} 
                      type={"submit"}>
                {item.label}
              </button>
             </div>

    case "submit":
      return <button disabled={isDisabled}
                     key={index} 
                     style={{alignSelf: 'flex-end'}} 
                     type={"submit"}>
          {item.label}
        </button>
    case "button":
      return <button 
        disabled={isDisabled}
        onClick={()=> this.handleStepControlClick(item)}
        key={index} 
        type={"button"}>
        {item.label}
        </button>
    default:
      return null
    }
  }

  render(){
    return <AppPackageBlockContainer>
              {
                true ? //!this.state.done ?
                <form ref={o => this.form } 
                  onSubmit={ this.sendAppPackageSubmit }>
                  {
                    this.renderElements()
                  }
                </form> : <p>aa</p>
              }
          </AppPackageBlockContainer>

  }
}


const TranslatedMessenger = withTranslation()(Messenger);

export default class ChaskiqMessenger {

  constructor(props){
    this.props = props
  }

  render(){
    //document.addEventListener('DOMContentLoaded', () => {
      var g = document.createElement('div');
      g.setAttribute("id", "ChaskiqMessengerRoot");
      document.body.appendChild(g);

      ReactDOM.render(
        <TranslatedMessenger {...this.props} i18n={i18n} />,
        document.getElementById("ChaskiqMessengerRoot")
      ) 
    //})
  }
} 