import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
//import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'

import {uniqBy} from 'lodash'
import actioncable from "actioncable"
import axios from "axios"
import UAParser from 'ua-parser-js'
import theme from './textEditor/theme'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import Tour from './UserTour'
import TourManager from './tourManager'
import {toCamelCase} from './shared/caseConverter'
import UrlPattern from 'url-pattern'
import { withTranslation } from 'react-i18next';
import i18n from './i18n'
import {
  PING, 
  CONVERSATIONS, 
  CONVERSATION,
  INSERT_COMMMENT,
  START_CONVERSATION,
  CONVERT,
  APP_PACKAGE_HOOK,
  PRIVACY_CONSENT,
} from './graphql/queries'
import GraphqlClient from './graphql/client'

import GDPRView from './gdprView'


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
  AssigneeStatus,
  Overflow,
  AssigneeStatusWrapper,
  FooterAck
} from './styles/styled'

import {
  CloseIcon,
  LeftIcon,
  MessageIcon,
  } from './icons'
import Quest from './messageWindow'
import StyledFrame from './styledFrame'

import Home from './homePanel'
import Article from './articles'
import Banner from './Banner'

import {Conversation, Conversations} from './conversation.js'
import {RtcView} from '../src/components/rtc'

import RtcViewWrapper, {CallStatus} from './rtcView'

let App = {}

class Messenger extends Component {

  constructor(props){
    super(props)

    // set language from user auth lang props 
    i18n.changeLanguage(this.props.lang);

    this.homeHeaderRef = React.createRef();

    this.state = {
      visible: true,
      enabled: null,
      agent_typing: false,
      article: null,
      showMoredisplay: false,
      conversation: {},
      inline_conversation: null,
      new_messages: this.props.new_messages,
      conversations: [],
      conversationsMeta: {},
      availableMessages: [],
      availableMessage: null,
      needsPrivacyConsent: null,
      //gdprContent: localStorage.getItem(`chaskiq-consent`) && JSON.parse(localStorage.getItem(`chaskiq-consent`)),
      banner: localStorage.getItem(`chaskiq-banner`) && JSON.parse(localStorage.getItem(`chaskiq-banner`)),
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
        translateY: -25,
        height: 212
      },
      transition: 'in',
      rtc: {  },
      videoSession: false,
      rtcAudio: true,
      rtcVideo: true
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
        'enc-data': this.props.encData || "",
        'session-id': this.props.session_id,
        lang: this.props.lang
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

    this.graphqlClient = new GraphqlClient({
      config: this.defaultHeaders,
      baseURL: `${this.props.domain}/api/graphql`
    })

    App = {
      cable: actioncable.createConsumer(`${this.props.ws}`)
    }

    this.overflow = null
    this.inlineOverflow = null
    this.commentWrapperRef = React.createRef();

    document.addEventListener("chaskiq_events", (event)=> {
      const {data, action} = event.detail
      switch (action) {
        case "wakeup":
          this.wakeup()
          break;
        case "toggle":
          this.toggleMessenger()
          break;
        case "convert":
          this.convertVisitor(data)
          break;
        case "trigger":
          this.requestTrigger(data)
          break;
        case "unload":
          //this.unload()
        default:
          break;
      } 
    });

    this.pling = new Audio(`${this.props.domain}/sounds/BING-E5.wav`)
  }

  componentDidMount(){
    this.visibility()
    
    this.ping(()=> {
      this.precenseSubscriber()
      this.eventsSubscriber()
      //this.getConversations()
      //this.getMessage()
      //this.getTours()
      this.locationChangeListener()
    })

    document.addEventListener("turbolinks:before-visit", ()=>{
      console.log('unload triggered')
      this.unload()
    })

    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions);

    window.addEventListener('message', (e)=> {
      if(e.data.tourManagerEnabled){
        //console.log("EVENTO TOUR!", e)
        this.setState({
          tourManagerEnabled: e.data.tourManagerEnabled, 
          ev: e
        })
      }
    }, false);

    window.opener && window.opener.postMessage(
      {type: "ENABLE_MANAGER_TOUR"}, "*"
    );
  }

  unload() {
    App.cable && App.cable.subscriptions.consumer.disconnect();
  }

  componentDidUpdate(prevProps, prevState){
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  setVideoSession(){
    this.setState({videoSession: !this.state.videoSession})
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
      console.log("Visibility browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
      // Handle page visibility change   
      // document.addEventListener(visibilityChange, handleVisibilityChange, false);
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
    this.pling.volume = 0.4
    this.pling.play()
  }

  updateRtcEvents = (data)=>{
    const conversation = this.state.conversation
    if (conversation && conversation.key === data.conversation_id ) { 
      //console.log("update rtc dsta", data)
      this.setState({rtc: data})
    }
  }

  eventsSubscriber = ()=>{
    App.events = App.cable.subscriptions.create(
      this.cableDataFor({channel: "MessengerEventsChannel"}),
      {
        connected: ()=> {
          //console.log("connected to events")
          this.registerVisit()

          if(!this.state.banner)
            App.events.perform('get_banners_for_user')
          //this.processTriggers()
        },
        disconnected: ()=> {
          //console.log("disconnected from events")
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
            case "banners:receive":
              this.receiveBanners(data.data)
              break
            case "triggers:receive":
              this.receiveTrigger(data.data)
              break
            case "conversations:conversation_part":
              const newMessage = toCamelCase(data.data)
              setTimeout(()=> this.receiveMessage(newMessage), 100)
              break
            case "conversations:typing":
              this.handleTypingNotification(toCamelCase(data.data))
              break
            case "conversations:unreads":
              this.receiveUnread(data.data)
              break
            case 'rtc_events':
              return this.updateRtcEvents(data)
            case "true":
              return true
            default:
              return 
          }
          //console.log(`received event`, data)
        },
        notify: ()=>{
          console.log(`notify event!!`)
        },
        handleMessage: (message)=>{
          console.log(`handle event message`, message)
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
    this.processMessage(newMessage)
  }

  updateMessage = (newMessage)=>{
    const new_collection = this.state.conversation.messages.collection.map(
      (o)=>{
        if (o.key === newMessage.key ){
          return newMessage
        } else {
          return o
        }
    })

    this.setState({
      conversation: Object.assign(this.state.conversation, {
        messages: { 
          collection: uniqBy(new_collection, 'key'),
          meta: this.state.conversation.messages.meta
         }
      })
    })
  }

  appendMessage = (newMessage) =>{
    this.setState({
      conversation: Object.assign(this.state.conversation, {
        messages: { 
          collection: [newMessage].concat(
            this.state.conversation.messages.collection
          ),
          meta: this.state.conversation.messages.meta
        }
      })
    }, ()=> {
      this.scrollToLastItem()
    })
    
    if (newMessage.appUser.kind === "agent") {
      this.playSound()
    }
  }

  processMessage = (newMessage)=>{

    this.setState({
      agent_typing: false
    })

    // when messenger hidden & not previous inline conversation
    if(!this.state.open && !this.state.inline_conversation){
      
      this.clearConversation(()=>{
        if (this.state.appData.inlineNewConversations){

          this.setConversation(newMessage.conversationKey, ()=>{
            this.setState({
              inline_conversation: newMessage.conversationKey
            }, ()=> {
              setTimeout(this.scrollToLastItem, 200)
            })
          })

        } else {
          this.setConversation(newMessage.conversationKey, ()=>{
            this.setState({
              display_mode: "conversation",
              open: true,
            }, ()=> {
              setTimeout(this.scrollToLastItem, 200)
            })
          })
        }
      })
      return
    }

    // return if message does not correspond to conversation
    if(this.state.conversation.key != newMessage.conversationKey) {
      return
    }

    // return on existings messages, fixes in part the issue on re rendering app package blocks
    // if(this.state.conversation.messages && this.state.conversation.messages.find((o)=> o.id === newMessage.id )) return
    
    // update or append
    if ( this.state.conversation.messages.collection.find( (o)=> o.key === newMessage.key ) ){
      this.updateMessage(newMessage)
    } else {
      this.appendMessage(newMessage)
    }
  }

  precenseSubscriber =()=>{
    App.precense = App.cable.subscriptions.create(this.cableDataFor({channel: "PresenceChannel"}),
    {
        connected: ()=> {
          //console.log("connected to presence")
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

  setInlineOverflow = (el)=>{
    this.inlineOverflow = el
  }

  ping =(cb)=>{
    
    this.graphqlClient.send(PING, {}, {
      success: (data)=>{
        this.setState({
          appData: data.messenger.app,
          agents: data.messenger.agents,
          enabled: data.messenger.enabledForUser,
          needsPrivacyConsent: data.messenger.needsPrivacyConsent
        }, ()=>{
          //console.log("subscribe to events")
          cb()
        })
      },
      error: ()=>{

      }
    })
  }

  insertComment =(comment, callbacks)=>{
    callbacks['before'] && callbacks['before']() 
    if(this.state.conversation.key && this.state.conversation.key != 'volatile'){
      this.createComment(comment, callbacks['sent'])
    }else{
      this.createCommentOnNewConversation(comment, callbacks['sent'])
    }
  }

  createComment =(comment, cb)=>{
    const id = this.state.conversation.key

    const message = {
      html: comment.html_content,
      serialized: comment.serialized_content,
      text: comment.text_content
    }

    // force an Assignment from client
    //if( this.state.conversation_messages.length === 0)
    //  opts['check_assignment_rules'] = true

    this.graphqlClient.send(INSERT_COMMMENT, {
      appKey: this.props.app_id,
      id: id,
      message: message
    }, {
      success: (data)=>{
        if(data.insertComment.message){
          this.receiveMessage(
            {...data.insertComment.message, 
              conversationKey: this.state.conversation.key
          })
        }

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
      text: comment.text_content,
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
            this.handleTriggerRequest("infer")
          cb && cb()
        })
      },
      error: ()=> {
        debugger
      }
    })
   }

  handleTriggerRequest = (trigger)=>{
    if (this.state.appData.tasksSettings){
      setTimeout(()=>{
        this.requestTrigger(trigger)
      }, 0 ) // 1000 * 60 * 2
    }
  }

  clearAndGetConversations = (options={}, cb)=>{
    this.setState(
      { conversationsMeta: {} }, 
      ()=> this.getConversations(options, cb)
    )
  }

  getConversations = (options={}, cb)=>{

    /*const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }*/

    const nextPage = this.state.conversationsMeta.next_page || 1

    this.graphqlClient.send(CONVERSATIONS, {
      page: options.page || nextPage,
      per: options.per
    }, {
      success: (data)=>{
        const { collection, meta } = data.messenger.conversations
        this.setState({
          conversations: options && options.append ? 
          this.state.conversations.concat(collection) : 
          collection,
          conversationsMeta: meta
        }, ()=> cb && cb() )
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
            messages: { 
              collection:  newCollection, 
              meta: meta 
            }
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
      //this.requestTrigger("infer")
    })

    /*
    if(this.state.appData.userTasksSettings && this.state.appData.userTasksSettings.share_typical_time && this.props.kind === "AppUser" )
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
    this.clearConversation(()=>{
      this.setConversation(o.key, () => {
        this.setTransition('out', ()=>{
          this.setDisplayMode('conversation', ()=>{
            this.scrollToLastItem()
          })
        })
      })
    })
  }

  convertVisitor(data){
    this.graphqlClient.send(CONVERT, {
      appKey: this.props.app_id, 
      email: data.email
    }, {
      success: (data)=>{
      },
      error: ()=>{
      }
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

  // check url pattern before trigger tours
  receiveTours = (tours)=>{
    const filteredTours = tours.filter((o)=>{
      var pattern = new UrlPattern(o.url.replace(/^.*\/\/[^\/]+/, ''))
      var url = document.location.pathname
      return pattern.match(url);
    })

    if(filteredTours.length > 0) this.setState({tours: filteredTours})
  }

  receiveBanners = (banner)=>{
    localStorage.setItem(`chaskiq-banner`, JSON.stringify(banner));
    this.setState({ banner: banner }, ()=>{
      App.events && App.events.perform(
        "track_open",
        {
          trackable_id: this.state.banner.id
        } 
      )
    })
  }


  sendConsent = (value)=>{
    this.graphqlClient.send(PRIVACY_CONSENT, {
      appKey: this.props.app_id, 
      consent: value
    }, {
      success: (data)=>{
        const val = data.privacyConsent.status
        this.ping(()=>{})
      },
      error: ()=>{
      }
    })
  }

  updateGdprConsent = (val)=>{
    this.sendConsent(val)
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
                  <img src={assignee.avatarUrl} />
                  <AssigneeStatusWrapper>
                    <p>{assignee.name}</p>
                    { 
                      this.state.appData && this.state.appData.replyTime && 
                      <AssigneeStatus>
                        {this.props.t(`reply_time.${this.state.appData.replyTime}`)}
                      </AssigneeStatus>
                    }
                  </AssigneeStatusWrapper>
                </React.Fragment>
              }
            </HeaderAvatar>
  }

  displayAppBlockFrame = (message)=>{
    this.setState({
      display_mode: "appBlockAppPackage",
      currentAppBlock: message,
    })
  }

  // received from app package iframes
  // TODO, send a getPackage hook instead, and call a submit action
  // save trigger id
  handleAppPackageEvent = (ev)=>{
    App.events && App.events.perform('app_package_submit', {
      conversation_key: this.state.conversation.key,
      message_key: this.state.currentAppBlock.message.key,
      data: ev.data
    })


    this.setState({
      currentAppBlock: {}, 
      display_mode: "conversation"
    }, ()=>{
      this.displayConversation(ev, this.state.conversation)
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
    const defaultscolors = {
      primary: "#121212",
      secondary: "#121212"
    }
    const {customizationColors} = this.state.appData

    return customizationColors ? 
    Object.assign({}, defaultscolors, customizationColors ) 
    : defaultscolors
    
  }

  toggleAudio= ()=> this.setState({rtcAudio: !this.state.rtcAudio})

  toggleVideo= ()=> this.setState({rtcVideo: !this.state.rtcVideo})

  getPackage = (params, cb) => {

    const newParams = {
      ...params,
      appKey: this.props.app_id
    }
    this.graphqlClient.send(
      APP_PACKAGE_HOOK, 
      newParams,
      {
        success: (data) => {
          cb && cb(data, this.updateMessage)
        },
        error: (data) => {
          cb && cb(data)
        },
        fatal: (data) => {
          cb && cb(data)
        }
      })
  }

  closeBanner = ()=>{
    if(!this.state.banner) return

    App.events && App.events.perform(
      "track_close",
      {
        trackable_id: this.state.banner.id
      } 
    )
    this.setState({banner: null})
    localStorage.removeItem("chaskiq-banner")
  }

  bannerActionClick = (url)=>{
    window.open(url,'_blank');

    App.events && App.events.perform(
      "track_click",
      {
        trackable_id: this.state.banner.id
      } 
    )
  }

  render() {
    const palette = this.themePalette()
    return (
        <ThemeProvider theme={{
          palette: this.themePalette(),
          mode: 'light', // this.state.appData ? this.state.appData.theme : 
          isMessengerActive: this.isMessengerActive()
        }}>
            <EditorWrapper>
              {
                this.state.availableMessages.length > 0 && this.isMessengerActive() &&
                <MessageFrame 
                  app_id={this.props.app_id}
                  axiosInstance={this.axiosInstance}
                  availableMessages={this.state.availableMessages} 
                  domain={this.props.domain}
                  t={this.props.t}
                />
              }

              {
                this.state.open && this.isMessengerActive() ?
                  <Container 
                    data-chaskiq-container='true'
                    open={this.state.open} 
                    isMobile={this.state.isMobile}>
                    
                    <SuperDuper> 
                      <StyledFrame style={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}>

                        <FrameBridge 
                          handleAppPackageEvent={this.handleAppPackageEvent}
                          >

                          { 
                            this.state.display_mode === "conversation" ?
                              <FrameChild 
                                state={this.state} 
                                props={this.props}
                                events={App.events}
                                updateRtc={(data)=> this.setState({rtc: data})}
                                toggleAudio={ this.toggleAudio }
                                toggleVideo={ this.toggleVideo }
                                setVideoSession={this.setVideoSession.bind(this)} 
                              /> : <div></div>
                          }

                          <SuperFragment>

                            {
                              this.state.isMobile ?
                              <CloseButtonWrapper>
                                <button onClick={() => this.toggleMessenger()}>
                                  <CloseIcon  
                                    palette={palette}
                                    style={{ height: '16px', width: '16px'}}
                                  />
                                </button>

                              </CloseButtonWrapper> : null
                            }

                            <Header 
                              style={{height: this.state.header.height}}
                              isMobile={this.state.isMobile}>
                              <HeaderOption 
                                in={this.state.transition}
                                >

                                { this.state.display_mode != "home" && 
                                  this.state.new_messages > 0 && 
                                  <CountBadge section={this.state.display_mode}>
                                    {this.state.new_messages}
                                  </CountBadge>
                                }

                                { this.state.display_mode != "home" ? 
                                  <LeftIcon 
                                    className="fade-in-right"
                                    onClick={this.displayHome.bind(this)}
                                    palette={palette}
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
                                  <HeaderTitle 
                                  ref={ this.homeHeaderRef }
                                  style={{
                                    padding: '2em',
                                    opacity: this.state.header.opacity,
                                    transform: `translateY(${this.state.header.translateY}px)`
                                  }}>
                                    {
                                      this.state.appData.logo && 
                                        <img style={{height: 50, width: 50}} 
                                          src={this.state.appData.logo}
                                        />
                                    }
                                    <h2 className={'title'}>
                                      {this.state.appData.greetings}
                                    </h2>
                                    <p className={'tagline'}>
                                      {this.state.appData.intro}
                                    </p>
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
                                <React.Fragment> 
                                  <Home 
                                    homeHeaderRef={this.homeHeaderRef}
                                    newMessages={this.state.new_messages}
                                    graphqlClient={this.graphqlClient}
                                    displayNewConversation={this.displayNewConversation}
                                    viewConversations={this.displayConversationList}
                                    updateHeader={this.updateHeader}
                                    transition={this.state.transition}
                                    displayArticle={this.displayArticle}
                                    appData={this.state.appData}
                                    agents={this.state.agents}
                                    displayAppBlockFrame={this.displayAppBlockFrame}
                                    displayConversation={this.displayConversation}
                                    conversations={this.state.conversations}
                                    conversationsMeta={this.state.conversationsMeta}
                                    getConversations={this.getConversations}
                                    getPackage={this.getPackage}
                                    {...this.props}
                                    t={this.props.t}
                                  />
                                  <FooterAck>
                                  <a href="https://chaskiq.io" target="blank"> 
                                    <img src={`${this.props.domain}/logo-gray.png`}/>
                                    {this.props.t('runon')}
                                  </a>
                                  </FooterAck>
                                </React.Fragment>
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
                                  domain={this.props.domain}
                                  lang={this.props.lang}
                                />
                              }

                              {
                                this.state.needsPrivacyConsent && //&& this.state.gdprContent
                                <GDPRView 
                                  app={this.state.appData}
                                  t={this.props.t}
                                  confirm={ (e)=> this.updateGdprConsent(true) }
                                  cancel={ (e)=> this.updateGdprConsent(false) }
                                />
                              }

                              { 
                                this.state.display_mode === "conversation" &&
                                
                                  <Conversation
                                    appData={this.state.appData}
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
                                    getPackage={this.getPackage}
                                    displayAppBlockFrame={this.displayAppBlockFrame}
                                    t={this.props.t}
                                  /> 
                              } 

                              {
                                <RtcViewWrapper 
                                  toggleVideo={this.toggleVideo}
                                  toggleAudio={this.toggleAudio}
                                  rtcVideo={this.state.rtcVideo}
                                  rtcAudio={this.state.rtcAudio}
                                  setVideoSession={this.setVideoSession.bind(this)}
                                  videoSession={this.state.videoSession}>
                                </RtcViewWrapper>
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
                                  app_id={this.props.app_id}
                                  enc_data={this.props.encData}
                                  conversation={this.state.conversation}
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
                <StyledFrame className="inline-frame" style={{
                  height: this.inlineOverflow ? 
                    this.inlineOverflow.offsetHeight + 35 + "px" : '',
                  maxHeight: window.innerHeight - 100
                }}>

                {
                  
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
                                <CloseIcon 
                                  palette={palette}
                                  style={{
                                  height: '10px',
                                  width: '10px',
                                }}
                              />
                            </button>
                        </ShowMoreWrapper>

                    }

                    <Conversation
                      appData={this.state.appData}
                      //disablePagination={true}
                      visible={this.state.visible}
                      pushEvent={this.pushEvent}
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
                      setInlineOverflow={this.setInlineOverflow}
                      submitAppUserData={this.submitAppUserData}
                      updateHeader={this.updateHeader}
                      transition={this.state.transition}
                      displayAppBlockFrame={this.displayAppBlockFrame}
                      t={this.props.t}
                    />
                  </div>
                  
                }
                  
                
                </StyledFrame>
              }

              { 
                this.isMessengerActive() ?
                <StyledFrame
                  id='chaskiqPrime' 
                  style={{
                    zIndex: '10000',
                    position: 'absolute',
                    bottom: '-18px',
                    width: '88px',
                    height: '100px',
                    right: '0px',
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
                        
                          <MessageIcon 
                            palette={palette} 
                            style={{ 
                              height: '28px',
                              width: '28px',
                              margin: '13px'
                            }}
                          /> : 
                          <CloseIcon 
                            palette={palette}
                            style={{
                              height: '26px',
                              width: '21px',
                              margin: '13px 16px',
                            }}
                          />
                      }
                    </div>
                  </Prime>  
                </StyledFrame> : null
              }

              {
                (this.state.open || this.state.inline_conversation) &&
                <div>
                  <Overflow/>
                </div>
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
                  t={this.props.t}
                  tours={this.state.tours}
                  events={App.events}
                  domain={this.props.domain}
                /> : null
              }

            <div id="TourManager"></div>

            { 
              this.state.banner && <Banner 
                {...this.state.banner.banner_data}
                onAction={ (url)=> {
                  this.bannerActionClick(url)
                }}
                onClose={ ()=>{ 
                  this.closeBanner()
                }}
                id={this.state.banner.id}
                serialized_content={
                  <DraftRenderer
                    domain={this.props.domain}
                    raw={ JSON.parse(this.state.banner.serialized_content) }
                  />
                }
              />
            }
          
        </ThemeProvider>
    );
  }
}

const FrameChild = ({ 
  document, window, state, 
  props, events, updateRtc, setVideoSession, 
  toggleAudio, toggleVideo 
}) => {
  return <React.Fragment>
    { 
      <RtcView 
        document={document}
        buttonElement={'callButton'}
        infoElement={'info'}
        localVideoElement={'localVideo'}
        remoteVideoElement={'remoteVideo'}
        callStatusElement={'callStatus'}
        callButtonsElement={'callButtons'}
        current_user={{ email: props.session_id }}
        rtc={state.rtc}
        handleRTCMessage={( data ) => { debugger }}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        rtcAudio={state.rtcAudio}
        rtcVideo={state.rtcVideo}
        onCloseSession={()=> {
          updateRtc({})
        } }
        toggleVideoSession={ () => setVideoSession(!state.videoSession)}
        video={state.videoSession}
        events={events}
        AppKey={props.app_id}
        conversation={state.conversation}
      /> 
    }
  </React.Fragment>
}

// frame internals grab
class FrameBridge extends Component {
  constructor(props){
    super(props)

    props.window.addEventListener('message', (e)=> {
      if(!e.data.chaskiqMessage) return
      props.handleAppPackageEvent(e)
    } , false);
  }
  
  render(){
    const {props} = this

    const children = React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, {
        window: props.window, 
        document: props.document
      });
    })

    return <React.Fragment>
            {children}
           </React.Fragment>
  }
}

class AppBlockPackageFrame extends Component {

  componentDidMount(){
  }

  render(){
    const {data} = this.props.appBlock
    const {message} = this.props.appBlock.message
    const {conversation} = this.props

    let src = null
    let url = null
    
    let params = {}

    const newData = {
      ...data,
      enc_data: this.props.enc_data,
      app_id: this.props.app_id
    }

    if(conversation.key && message){
      /*params = {
        data: data,
        message: message,
        message_id: this.props.appBlock.data,
        conversation_id: conversation.key
      }*/

      params = JSON.stringify({data: newData})
      const blocks = toCamelCase(message.blocks)
      let url = `${this.props.domain}/package_iframe/${blocks.appPackage.toLowerCase()}`
      src = new URL(url)

    } else {
      params = JSON.stringify({data: newData})
      let url = `${this.props.domain}/package_iframe/${data.id}`
      src = new URL(url)
    }

    src.searchParams.set("data", params)

    return <div>
              <iframe
                id="package-frame"
                //sandbox="allow-top-navigation allow-same-origin allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
                src={src.href} 
                style={{
                  width: '100%',
                  height: 'calc(100vh - 75px)',
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

  handleMinus = (ev) => {
    ev.preventDefault()
    this.toggleMinimize(ev)
  }

  handleCloseClick = (ev) => {
    ev.preventDefault()
    this.handleClose(ev)
  }

  handleClose = (message)=>{
    App.events && App.events.perform(
      "track_close",
      {
        trackable_id: message.id
      } 
    )
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
    App.events && App.events.perform("track_open", 
      {
        trackable_id: this.props.availableMessage.id  
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

      var g = document.getElementById(this.props.wrapperId) 
      if(!g){
        var g = document.createElement('div');
        g.setAttribute("id", this.props.wrapperId);
        document.body.appendChild(g);
      }

      ReactDOM.render(
        <TranslatedMessenger {...this.props} i18n={i18n} />,
        document.getElementById("ChaskiqMessengerRoot")
      ) 
    //})
  }
} 