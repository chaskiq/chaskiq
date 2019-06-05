import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import actioncable from "actioncable"
import {
  Route,
  Link
} from 'react-router-dom'
import styled from "styled-components"
import gravatar from "gravatar"
import Moment from 'react-moment';
import ConversationEditor from '../components/Editor.js'
import {convertToHTML} from 'draft-convert'
import Avatar from '@atlaskit/avatar';
import {soundManager} from 'soundmanager2'
import sanitizeHtml from 'sanitize-html';
import graphql from "../graphql/client"
import { CONVERSATIONS, CONVERSATION, APP_USER } from "../graphql/queries"
import { INSERT_COMMMENT } from '../graphql/mutations'
import './convo.scss'

import UserListItem from '../components/UserListItem'
import Accordeon from '../components/accordeon'

import UserData from '../components/UserData'


import { camelCase } from 'lodash';

const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

const RowColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex: 1;
`;
const GridElement = styled.div`
  flex: 1;
  overflow: scroll;
  border-right: 1px solid #dcdcdc;
  h3 {
    margin-left: 20px;
  }
`;
const MessageContainer = styled.div`
  text-decoration: none;
  display: block;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0,0,0,.1);
  padding: 14px 20px 14px 0;
  background-color: #fff;
  border-left: 2px solid transparent;
  cursor: pointer;
  &:hover{
    background: aliceblue;
  }
`
const MessageControls = styled.div`
  display: flex;
  align-items: flex-start;
`
const MessageHeader = styled.div`
  //flex: 1 1 auto;
  //min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`
const MessageBody = styled.div`
    font-size: 14px;
    color: #bfbfbf;
    font-weight: 100;
    margin-top: 16px;
    text-indent: 10px;
    display: flex;
`
const MessageEmail = styled.div`
    color: #222;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
`
const ActivityAvatar = styled.div`
  //display: flex;
  align-self: center;
  position: relative;
`
const Overflow = styled.div`
  overflow: auto;
  //height: 100vh;
  height: calc(100vh - 149px);
`
const ActivityIndicator = styled.span`
  position: absolute;
  height: 10px;
  width: 10px;
  background: #1be01b;
  border-radius: 10px;
  top: 6px;
  left: 64px;
`
const FixedHeader = styled.div`
  padding:20px;
  border-bottom: 1px solid #ccc;
`
const ChatMessageItem = styled.div`
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
      margin-right: 61px;
      float: right;
      background: #073152;
      color: #eceff1; 
    }
`;

const ChatAvatar = styled.div`
    
    //background: rgba(0, 0, 0, 0.03);
    position: absolute;
    top: 0;

    &.user{
      left: -52px;
    }

    &.admin{
      right: -47px;
    }

    img {
      width: 40px;
      height: 40px;
      text-align: center;
      border-radius: 50%;
    }
`
const StatusItem = styled.span`
  font-size: 9px;
  color: #ccc;
`
const UserDataList = styled.ul`
  li{
    span{
      margin-left:10px;
    }
  }
`



const playSound = ()=>{
  soundManager.createSound({
    id: 'mySound',
    url: '/sounds/pling.mp3',
    autoLoad: true,
    autoPlay: false,
    //onload: function () {
    //  alert('The sound ' + this.id + ' loaded!');
    //},
    volume: 50
  }).play()
}

class MessageItem extends Component {
  render(){
    const user = this.props.conversation.mainParticipant
    return (
      <MessageContainer>

        <MessageControls/>

        <MessageHeader>
        
          <Avatar src={gravatar.url(user.email)} width={40} heigth={40}/>
          
          <MessageEmail>
            {user.email}
          </MessageEmail>

          <Moment fromNow style={{ color: '#ccc', fontSize: '10px'}}>
            {this.props.message.created_at}
          </Moment>

        </MessageHeader>

        <MessageBody>

          {
            user.id != this.props.message.appUser.id ?
            <Avatar 
              src={gravatar.url(this.props.message.appUser.email)} 
              size={'xsmall'}
              style={{'float':'left'}}
            /> : null
          }  
              
          <span dangerouslySetInnerHTML={
            { __html: sanitizeHtml(this.props.message.message).substring(0, 250) }
          }/>
          
        </MessageBody>

      </MessageContainer>
    )
  }
}

export default class ConversationContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversations: [],
      meta: {}
    }
  }

  componentDidMount(){
    this.getConversations()
  }

  handleScroll = (e) => {
    let element = e.target

    console.log(element.scrollHeight - element.scrollTop, element.clientHeight)
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.state.meta.next_page)
        this.getConversations({ append: true })
    }
  }

  getConversations = (cb)=>{
    const nextPage = this.state.meta.next_page || 1

    graphql(CONVERSATIONS, { 
      appKey: this.props.match.params.appId, 
      page: nextPage}, {
      success: (data)=>{
        const conversations = data.app.conversations
        this.setState({
          conversations: nextPage > 1 ? this.state.conversations.concat(conversations.collection) : conversations.collection,
          meta: conversations.meta
        })
        cb ? cb() : null        
      }
    })

    /*
    axios.get(`/apps/${this.props.match.params.appId}/conversations.json?page=${nextPage}`, {})
      .then( (response)=> {
        this.setState({
          conversations: nextPage > 1 ? this.state.conversations.concat(response.data.collection) : response.data.collection,
          meta: response.data.meta
        })
        cb ? cb() : null
      })
      .catch( (error)=>{
        console.log(error);
      });
    */
  }


  render(){
    const {appId} = this.props.match.params

    return <RowColumnContainer>
            <ColumnContainer>
              
              <GridElement>
                {/*<FixedHeader>Conversations</FixedHeader>*/}
                
                <FixedHeader>
                  Conversations
                </FixedHeader>

                <Overflow onScroll={this.handleScroll}>
                  {
                    this.state.conversations.map((o, i)=>{
                      const user = o.mainParticipant

                      return <div key={o.id} onClick={(e)=> this.props.history.push(`/apps/${appId}/conversations/${o.id}`) }>
                                
                                <UserListItem
                                  mainUser={user}
                                  messageUser={o.lastMessage.appUser}
                                  //createdAt={o.lastMessage.message.created_at}
                                  message={sanitizeHtml(o.lastMessage.message).substring(0, 250)}
                                />

                                {/*<MessageItem 
                                  conversation={o} 
                                  message={o.lastMessage}
                                />*/}
                              </div>
                    })
                  }
                </Overflow>
              </GridElement>

              <Route exact path={`/apps/${appId}/conversations/:id`} 
                  render={(props)=>(
                    <ConversationContainerShow
                      appId={appId}
                      currentUser={this.props.currentUser}
                      {...props}
                    />
                )} /> 

            </ColumnContainer>
          </RowColumnContainer>
  }
}

class MessageItemWrapper extends Component {
  componentDidMount(){
    // console.log(this.props.data.readAt ? "yes" : "EXEC A READ HERE!")
    // mark as read on first render
    if(!this.props.data.readAt){
      console.log(this.props.email)
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

class ConversationContainerShow extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversation: {},
      messages: [],
      meta: {},
      appUser: {}
    }
  }

  componentDidMount(){
    this.getMessages()
  }

  componentDidUpdate(PrevProps, PrevState){
    if(PrevProps.match && PrevProps.match.params.id !== this.props.match.params.id){
      this.setState({
        conversation: {},
        messages: [],
        meta: {}
      }, this.getMessages)
      
      //this.conversationSubscriber()
    }
  }

  handleScroll = (e) => {
    let element = e.target

    console.log(element.scrollHeight - element.scrollTop, element.clientHeight)
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.state.meta.next_page)
        this.getMessages()
    }
  }

  getMainUser = (id)=> {
    graphql(APP_USER, { appKey: this.props.appId, id: id }, {
      success: (data) =>{
        this.setState({
          appUser: data.app.appUser
        })        
      }
    })
  }

  getMessages = ()=>{
    const nextPage = this.state.meta.next_page

    graphql(CONVERSATION, { 
      appKey: this.props.appId, 
      id: parseInt(this.props.match.params.id), 
      page: nextPage}, {
      success: (data)=>{
        const conversation = data.app.conversation
        
          this.setState({
            conversation: conversation,
          }, () => {
            this.conversationSubscriber()
            
            this.setState({
              messages: nextPage > 1 ? this.state.messages.concat(conversation.messages.collection) : conversation.messages.collection,
              meta: conversation.messages.meta
            },  ()=>{
                this.getMainUser(this.state.conversation.mainParticipant.id)
            })
          })

      },
      error: (error)=>{
        
      }
    })

    
    /*
      axios.get(`/apps/${this.props.appId}/conversations/${this.props.match.params.id}.json?page=${nextPage}`, {
        email: this.props.email,
      })
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation,
        }, ()=>{ 
          this.conversationSubscriber()
          this.getMainUser(this.state.conversation.mainParticipant.id)
          this.setState({
            messages: nextPage > 1 ? this.state.messages.concat(response.data.messages) : response.data.messages,
            meta: response.data.meta
          }) 
        } )
      })
      .catch( (error)=> {
        console.log(error);
      });

    */
  }

  insertComment = (comment, cb)=>{
    const id = this.state.conversation.id
    const html_comment = convertToHTML( comment );

    graphql(INSERT_COMMMENT, { 
      appKey: this.props.appId, 
      id: id, 
      message: html_comment
    }, {
        success: (data)=>{
          console.log(data)
          cb()
        },
        error: (error)=>{
          console.log(error)
        }
      })

    /*
      axios.put(`/apps/${this.props.appId}/conversations/${id}.json`, {
        email: this.props.currentUser.email,
        id: id,
        message: html_comment
      })
      .then( (response)=> {
        console.log(response)
        cb()
      })
      .catch( (error)=> {
        console.log(error);
      });
      */
  }

  scrollToLastItem = ()=>{
    this.refs.overflow.scrollTop = this.refs.overflow.scrollHeight;
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
      app: this.props.appId,
      id: this.state.conversation.id,
      email: this.props.currentUser.email,
      inner_app: true,
    },
    {
      connected: ()=> {
        console.log("connected to conversations")
      },
      disconnected: ()=> {
        console.log("disconnected from conversations")
      },
      received: (data)=> {

        const newData = camelizeKeys(data)

        if (this.state.messages.find((o) => o.id === newData.id ) ){
          const new_collection = this.state.messages.map((o)=>{
            if (o.id === newData.id ){
                return newData
              } else {
                return o
              }
          })

          console.log('received updated', newData)
          this.setState({
            messages: new_collection
          } )

        } else {
          console.log('received new', newData)
          console.log(this.props.currentUser.email, newData.appUser.email)
          if (this.props.currentUser.email !== newData.appUser.email) {
            playSound()
          }

          console.log(newData)
          
          this.setState({
            messages: this.state.messages.concat(newData)
          }, this.scrollToLastItem)

        }
      },
      handleMessage: (message)=>{
        console.log(`handle message`)
      } 
    });    
  }

  render(){
    return <Fragment>
          
            <GridElement>

              <div className="chat">
                <FixedHeader>
                  Conversation with {" "}

                  {
                    this.state.conversation.mainParticipant ? 
                    <b>{this.state.conversation.mainParticipant.email}</b> 
                    : null
                  }

                </FixedHeader>

                  <div className="overflow" 
                    ref="overflow" 
                    onScroll={this.handleScroll}
                    style={{
                      boxShadow: 'inset 0px 1px 3px 0px #ccc',
                      background: 'aliceblue'
                    }}>

                  {
                    this.state.messages.map( (o, i)=> {

                      const userOrAdmin = this.state.conversation.mainParticipant.email === o.appUser.email ? 
                                    'user' : 'admin'
         
                      return <MessageItemWrapper 
                                key={o.id} 
                                data={o} 
                                email={this.props.currentUser.email}>

                                <ChatMessageItem className={userOrAdmin}>
                                  
                                  <ChatAvatar className={userOrAdmin}>
                                    <img src={gravatar.url(o.appUser.email)}/>
                                  </ChatAvatar>

                                  <div  
                                    key={i}
                                    dangerouslySetInnerHTML={{__html:  o.message }} 
                                  />

                                  <StatusItem>
                                    {
                                      o.readAt ? 
                                        <Moment fromNow>
                                          {o.readAt}
                                        </Moment> : <span>not seen</span>
                                    }
                                  </StatusItem>
                                  
                                </ChatMessageItem>
                              </MessageItemWrapper>
                            })
                  }

                </div>

                <div className="input">
                  
                  <ConversationEditor 
                    insertComment={this.insertComment}
                  />

                </div>
              </div>

            </GridElement>

            <GridElement>

              <FixedHeader>
                  User information
              </FixedHeader>

              <Overflow style={{ 
                display: 'flex', 
                flexFlow: 'column',
                paddingTop: '20px'
              }}>

                <UserData 
                  width={ '100%'}
                  appUser={this.state.appUser}
                />

              </Overflow>

            </GridElement>

          </Fragment>
  }
}