import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
//import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'
import actioncable from "actioncable"
import axios from "axios"
import UAParser from 'ua-parser-js'
import theme from './textEditor/theme'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import Tour from './UserTour'
import gravatar from "./shared/gravatar"
import { soundManager } from 'soundmanager2'
import {toCamelCase} from './shared/caseConverter'
import UrlPattern from 'url-pattern'
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

import {
  Container,
  UserAutoMessage,
  EditorWrapper,
  Prime,
  Header,
  Body,
  HeaderOption,
  HeaderTitle,
  SuperDuper,
  UserAutoMessageStyledFrame,
  CloseButtonWrapper,
  SuperFragment,
  UserAutoMessageFlex,
  MessageCloseBtn,
  HeaderAvatar,
  CountBadge,
  ShowMoreWrapper,
  AssigneeStatus
} from './styles/styled'

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

import {Conversation, Conversations} from './conversation.js'

let App = {}

class Messenger extends Component {

  constructor(props){
    super(props)

    // set language from user auth lang props 
    i18n.changeLanguage(this.props.lang);

    this.state = {
      visible: true,
      enabled: null,
      agent_typing: false,
      article: null,
      showMoredisplay: false,
      conversation: {},
      inline_conversation: null,
      new_messages: this.props.new_messages,
      //conversation_messages: [],
      //conversation_messagesMeta: {},
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

    this.delayTimer = null

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
        enc_data: this.props.encData || "",
        session_id: this.props.session_id,
        lang: this.props.locale
      }

      this.defaultCableData = { 
        app: this.props.app_id, 
        enc_data: this.props.encData || "",
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

    document.addEventListener("chaskiq_events", (event)=> {
      console.log("RECEIVED CHASKIQ EVENT", event)
      const {data, action} = event.detail
      switch (action) {
        case "wakeup":
          this.wakeup()
          break;
        case "toggle":
          this.toggleMessenger()
          break;
        default:
          break;
      } 
    });

  }

  componentDidMount(){

    //this.eventsSubscriber()

    this.visibility()
    
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

  visibility(){
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange; 
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }
    
    const handleVisibilityChange = ()=> {
      if (document[hidden]) {
        //console.log("INVISIBLE")
        this.setState({visible: false})
      } else {
        //console.log("VISIBLE")
        this.setState({visible: true})
      }
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || hidden === undefined) {
      console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
      // Handle page visibility change   
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
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
              this.receiveTours([data.data])
              break
            case "triggers:receive":
              this.receiveTrigger(data.data)
              break
            case "conversations:conversation_part":
              const newMessage = toCamelCase(data.data)
              this.receiveMessage(newMessage)
              break

            case "conversations:typing":
              this.handleTypingNotification(toCamelCase(data.data))
              break
            case "conversations:unreads":
              this.receiveUnread(data.data)
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

  handleTypingNotification = (data)=>{
    clearTimeout(this.delayTimer);
    this.handleTyping(data)
  }

  handleTyping = (data)=>{
    if(this.state.conversation.key === data.conversation){
      this.setState({agent_typing: data}, ()=>{
        this.delayTimer = setTimeout(()=> {
          this.setState({agent_typing: null})
        }, 1000);
      })
    }
  }

  receiveUnread = (newMessage)=>{
    this.setState({new_messages: newMessage})
  }

  receiveMessage = (newMessage)=>{

    this.setState({
      agent_typing: false
    })

    // when messenger hidden & not previous inline conversation
    if(!this.state.open && !this.state.inline_conversation){
      
      this.clearConversation(()=>{
        this.setConversation(newMessage.conversationKey, ()=>{
          this.setState({
            inline_conversation: newMessage.conversationKey
          }, ()=> setTimeout(this.scrollToLastItem, 200) )
        })
      })

      return
    }

    // return if message does not correspond to conversation
    if(this.state.conversation.key != newMessage.conversationKey) return

    // return on existings messages, fixes in part the issue on re rendering app package blocks
    // if(this.state.conversation.messages && this.state.conversation.messages.find((o)=> o.id === newMessage.id )) return

    // append or update
    if ( this.state.conversation.messages.collection.find( (o)=> o.id === newMessage.id ) ){
      const new_collection = this.state.conversation.messages.collection.map((o)=>{
          if (o.id === newMessage.id ){
            return newMessage
          } else {
            return o
          }
      })

      this.setState({
        conversation: Object.assign(this.state.conversation, {
          messages: { 
            collection: new_collection,
            meta: this.state.conversation.messages.meta
           }
        })
      })

    } else {

      this.setState({
        conversation: Object.assign(this.state.conversation, {
          messages: { 
            collection: [newMessage].concat(this.state.conversation.messages.collection) ,
            meta: this.state.conversation.messages.meta
          }
        })
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
        //if(this.state.display_mode === "conversation")
        if(this.state.conversation.messages)
          messages = messages.concat(conversation.messages.collection)

        this.setState({
          conversation: Object.assign(conversation, {messages: {collection: messages }}),
          //conversation_messages: messages
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

  getConversations = (options={})=>{

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    const nextPage = this.state.conversationsMeta.next_page || 1

    this.graphqlClient.send(CONVERSATIONS, {
      page: options.page || nextPage,
      per: options.per
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

  setConversation = (id , cb)=>{
    const currentMeta = this.getConversationMessagesMeta() || {}
    const nextPage = currentMeta.next_page || 1
    this.graphqlClient.send(CONVERSATION, {
      id: id,
      page: nextPage
    }, {
      success: (data)=>{
        const {conversation} = data.messenger
        const {messages} = conversation
        const {meta, collection} = messages

        const newCollection = nextPage > 1 ? 
        this.state.conversation.messages.collection.concat(collection) : 
        messages.collection 

        this.setState({
          conversation: Object.assign(this.state.conversation, conversation, {
            messages: { collection:  newCollection, meta: meta }
          }),
          //conversation_messages: nextPage > 1 ? this.state.conversation.messages.collection.concat(messages.collection) : messages.collection ,
          //conversation_messagesMeta: messages.meta
        }, cb)
      },
      error: (error)=>{
        debugger
      }
    })
  }

  getConversationMessages = ()=>{
    if(!this.state.conversation.messages) return {}
    const {collection} = this.state.conversation.messages
    return collection
  }

  getConversationMessagesMeta = ()=>{
    if(!this.state.conversation.messages) return {}
    const {meta} = this.state.conversation.messages
    return meta
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
      //conversation_messages: [],
      //conversation_messagesMeta: {},
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

  clearConversation = (cb)=>{
    this.setState({
      conversation: {},
    } , cb)
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


      this.setConversation(o.key, () => {
        this.setTransition('out', ()=>{
          this.setDisplayMode('conversation', ()=>{
            this.scrollToLastItem()
          })
        })
      })
  }

  toggleMessenger = (e)=>{
    this.setState({
      open: !this.state.open, 
      //display_mode: "conversations",
    }, this.clearInlineConversation )
  }

  wakeup = ()=>{
    this.setState({open: true})
  }

  isUserAutoMessage = (o)=>{
    return o.message_source && o.message_source.type === "UserAutoMessage"
  }

  isMessengerActive = ()=>{
    return !this.state.tourManagerEnabled && 
    this.state.enabled && 
    this.state.appData && 
    (this.state.appData.activeMessenger == "on" || 
      this.state.appData.activeMessenger == "true" || 
      this.state.appData.activeMessenger === true
    )
  }

  isTourManagerEnabled = ()=>{
    return true
    /*return window.opener && window.opener.TourManagerEnabled ? 
      window.opener.TourManagerEnabled() : null*/
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

  pushEvent = (name , data)=>{
    App.events && App.events.perform(name, data)
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

  assignee =()=>{
    const {lastMessage, assignee} = this.state.conversation
    if(assignee) return assignee
    if(!lastMessage) return null
    if(!assignee && lastMessage.appUser.kind === "agent") return lastMessage.appUser
  }

  renderAsignee = ()=>{
    const assignee = this.assignee()
  
    return <HeaderAvatar>
              { assignee && 
                <React.Fragment>
                  <img src={gravatar(assignee.email)} />
                  <div>
                    <p>{assignee.name}</p>
                    { 
                      this.state.appData && this.state.appData.replyTime && 
                      <AssigneeStatus>
                        {this.props.t(`reply_time.${this.state.appData.replyTime}`)}
                      </AssigneeStatus>
                    }
                  </div>
                </React.Fragment>
              }
            </HeaderAvatar>
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

  showMore = ()=>{
    this.toggleMessenger()
    this.setState({
      display_mode: "conversation",
      inline_conversation: null
    }, ()=> setTimeout(this.scrollToLastItem, 200) )
  }

  clearInlineConversation = ()=>{
    this.setState({
      inline_conversation: null
    })
  }

  displayShowMore = ()=>{
    this.setState({
      showMoredisplay: true
    })
  }

  hideShowMore = ()=>{
    this.setState({
      showMoredisplay: false
    })
  }

  themePalette = ()=>{
    const {customizationColors} = this.state.appData
    return customizationColors ? customizationColors : {
      primary: "#121212",
      secondary: "#ccc"
    }
  }

  render() {
    return (
        <ThemeProvider theme={{
          pallete: this.themePalette(),
          mode: this.state.appData ? this.state.appData.theme : 'light',
          isMessengerActive: this.isMessengerActive()
        }}>
         
            <EditorWrapper>

              {
                
                this.state.availableMessages.length > 0 && this.isMessengerActive() &&
                <MessageFrame 
                  app_id={this.props.app_id}
                  axiosInstance={this.axiosInstance}
                  availableMessages={this.state.availableMessages} 
                  t={this.props.t}
                />
                
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

                            {
                              this.state.isMobile ?
                              <CloseButtonWrapper>
                                <button onClick={() => this.toggleMessenger()}>
                                  <CloseIcon style={{ height: '16px', width: '16px'}}/>
                                </button>

                              </CloseButtonWrapper> : null
                            }

                            <Header 
                              style={{height: this.state.header.height}}
                              isMobile={this.state.isMobile}>
                              <HeaderOption 
                                in={this.state.transition}
                                >

                                { this.state.new_messages > 0 && 
                                  <CountBadge section={this.state.display_mode}>
                                    {this.state.new_messages}
                                  </CountBadge>
                                }

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
                                  displayConversation={this.displayConversation}
                                  conversations={this.state.conversations}
                                  getConversations={this.getConversations}
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
                                    visible={this.state.visible}
                                    clearConversation={this.clearConversation}
                                    isMobile={this.state.isMobile}
                                    agent_typing={this.state.agent_typing}
                                    domain={this.props.domain}
                                    conversation={this.state.conversation}
                                    isUserAutoMessage={this.isUserAutoMessage}
                                    insertComment={this.insertComment}
                                    setConversation={this.setConversation}
                                    setOverflow={this.setOverflow}
                                    submitAppUserData={this.submitAppUserData}
                                    updateHeader={this.updateHeader}
                                    transition={this.state.transition}
                                    pushEvent={this.pushEvent}
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
                !this.state.open && 
                this.state.inline_conversation && 
                <StyledFrame className="inline-frame" style={{}}>

                  <div 
                    onMouseEnter={this.displayShowMore} 
                    onMouseLeave={this.hideShowMore}
                    >

                    {
                      this.state.showMoredisplay &&
                    
                        <ShowMoreWrapper in={
                          this.state.showMoredisplay ? "in" : "out"
                        }>
                            <button
                              onClick={()=>{
                                this.showMore()
                              }}>
                                mostrar mas
                            </button>
                            <button 
                              onClick={()=>this.clearInlineConversation()} 
                              className="close">
                                <CloseIcon style={{
                                  height: '10px',
                                  width: '10px',
                                }}
                              />
                            </button>
                        </ShowMoreWrapper>

                    }

                    <Conversation
                      disablePagination={true}
                      inline_conversation={this.state.inline_conversation}
                      footerClassName="inline"
                      clearConversation={this.clearConversation}
                      isMobile={this.state.isMobile}
                      domain={this.props.domain}
                      //conversation_messages={this.state.conversation_messages}
                      conversation={this.state.conversation}
                      //conversation_messagesMeta={this.state.conversation_messagesMeta}
                      isUserAutoMessage={this.isUserAutoMessage}
                      insertComment={this.insertComment}
                      setConversation={this.setConversation}
                      setOverflow={this.setOverflow}
                      submitAppUserData={this.submitAppUserData}
                      updateHeader={this.updateHeader}
                      transition={this.state.transition}
                      displayAppBlockFrame={this.displayAppBlockFrame}
                      t={this.props.t}
                    />
                  </div>
                
                </StyledFrame>
              }


              { 
                this.isMessengerActive() ?
                <StyledFrame style={{
                    zIndex: '10000000',
                    position: 'absolute',
                    bottom: '-18px',
                    width: '88px',
                    height: '100px',
                    right: '-23px',
                    border: 'none'
                  }}>

                  <Prime id="chaskiq-prime" 
                    onClick={this.toggleMessenger}>
                    <div style={{
                      transition: 'all .2s ease-in-out',
                      transform: !this.state.open ? '' : 'rotate(180deg)',
                    }}>

                      {
                        !this.state.open && this.state.new_messages > 0 && 
                        <CountBadge>
                          {this.state.new_messages}
                        </CountBadge>
                      }

                      {
                        !this.state.open ?
                        
                          <MessageIcon style={{ 
                            height: '43px',
                            width: '36px',
                            margin: '8px 0px'
                          }}/> : 
                          <CloseIcon style={{
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

            </EditorWrapper>


            {
              this.state.tourManagerEnabled ?
              <TourManager 
                ev={this.state.ev}
                domain={this.props.domain}
              /> : 
                this.state.tours.length > 0 ? 
                <Tour 
                  tours={this.state.tours}
                  events={App.events}
                /> : null
            }

            <div id="TourManager"></div>
         
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
    App.events && App.events.perform(
      "track_close",
      {
        trackable_id: message.id, 
        trackable_type: "UserAutoMessage"
      } 
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
                      domain={this.props.domain}
                      t={this.props.t}
                    />
                  </UserAutoMessage>
          })

        }
          </UserAutoMessageFlex>


    </UserAutoMessageStyledFrame>
  }
}

class MessageContainer extends Component {
  
  componentDidMount(){
    console.log("App.events", App.events)
    App.events && App.events.perform("track_open", 
      {
        trackable_id: this.props.availableMessage.id, 
        trackable_type: "UserAutoMessage"  
      }   
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
                    domain={this.props.domain}
                    raw={JSON.parse(this.props.availableMessage.serialized_content)}
                  />
                </DanteContainer>
              </ThemeProvider>  
           </Quest>
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