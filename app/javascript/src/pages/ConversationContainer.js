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
import './convo.scss'

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
  height: 100vh;
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
      margin-right: 20px;
      float: right;
      background: #073152;
      color: #eceff1; 
    }
`;
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
    return (
      <MessageContainer>

        <MessageControls/>

        <MessageHeader>
        
          <Avatar src={gravatar.url(this.props.message.app_user.email)} width={40} heigth={40}/>
          
          <MessageEmail>
            {this.props.message.app_user.email}
          </MessageEmail>

          <Moment fromNow style={{ color: '#ccc', fontSize: '10px'}}>
            {this.props.message.created_at}
          </Moment>

        </MessageHeader>

        <MessageBody>          
          <span dangerouslySetInnerHTML={
            {__html: this.props.message.message}
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
      conversations: []
    }
  }

  componentDidMount(){
    this.getConversations()
  }

  getConversations = (cb)=>{

    axios.get(`/apps/${this.props.match.params.appId}/conversations.json`, {})
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


  render(){
    const {appId} = this.props.match.params

    return <RowColumnContainer>
            <ColumnContainer>
              
              <GridElement>
                {/*<FixedHeader>Conversations</FixedHeader>*/}
                
                <FixedHeader>
                  Conversations
                </FixedHeader>

                <Overflow>
                  {
                    this.state.conversations.map((o, i)=>{
                      return <div key={o.id} onClick={(e)=> this.props.history.push(`/apps/${appId}/conversations/${o.id}`) }>
                                <MessageItem message={o.last_message}/>
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
    // console.log(this.props.data.read_at ? "yes" : "EXEC A READ HERE!")
    // mark as read on first render
    if(!this.props.data.read_at){
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
      app_user: {}
    }
  }

  componentDidMount(){
    this.getMessages()
  }

  componentDidUpdate(PrevProps, PrevState){
    if(PrevProps.match && PrevProps.match.params.id !== this.props.match.params.id){
      this.getMessages()
      //this.conversationSubscriber()
    }
  }

  getMainUser = (id)=> {
    axios.get(`/apps/${this.props.appId}/app_users/${id}.json`)
      .then( (response)=> {
        this.setState({
          app_user: response.data.app_user
        })
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  getMessages = ()=>{
    axios.get(`/apps/${this.props.appId}/conversations/${this.props.match.params.id}.json`, {
        email: this.props.email,
      })
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation
        }, ()=>{ 
          this.conversationSubscriber()
          this.getMainUser(this.state.conversation.main_participant.id)
          this.setState({messages: response.data.messages}) 
        } )
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  insertComment = (comment, cb)=>{
    const id = this.state.conversation.id
    const html_comment = convertToHTML( comment );
    axios.put(`/api/v1/apps/${this.props.appId}/conversations/${id}.json`, {
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
    },
    {
      connected: ()=> {
        console.log("connected to conversations")
      },
      disconnected: ()=> {
        console.log("disconnected from conversations")
      },
      received: (data)=> {
        console.log(data.message)

        if ( this.state.messages.find( (o)=> o.id === data.id ) ){
          
          const new_collection = this.state.messages.map((o)=>{
              if (o.id === data.id ){
                return data
              } else {
                return o
              }
          })

          console.log('received updated', data)
          this.setState({
            messages: new_collection
          } )

        } else {
          console.log('received new', data)
          console.log(this.props.currentUser.email, data.app_user.email)
          if (this.props.currentUser.email !== data.app_user.email) {
            playSound()
          }

          this.setState({
            messages: this.state.messages.concat(data)
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
                    this.state.conversation.main_participant ? 
                    <b>{this.state.conversation.main_participant.email}</b> 
                    : null
                  }

                </FixedHeader>

                <div className="overflow" ref="overflow">

                  {
                    this.state.messages.map( (o, i)=> {
                      return <MessageItemWrapper 
                                key={o.id} 
                                data={o} 
                                email={this.props.currentUser.email}>
                                <ChatMessageItem 
                                  className={this.state.conversation.main_participant.email === o.app_user.email ? 'user' : 'admin'}>
                                  <ChatAvatar>
                                    <img src={gravatar.url(o.app_user.email)}/>
                                  </ChatAvatar>

                                  <div  
                                    key={i}
                                    dangerouslySetInnerHTML={{__html: o.message}} 
                                  />

                                  <StatusItem>
                                    {
                                      o.read_at ? 
                                        <Moment fromNow>
                                          {o.read_at}
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

                <ActivityAvatar>
                  
                  <img src={gravatar.url(this.state.app_user.email)} 
                    width={80} 
                    heigth={80}
                  />
                  
                  {
                    this.state.app_user.state === "online" ?
                      <ActivityIndicator/> : null 
                  }
                  
                </ActivityAvatar>


                  <p style={{
                    display: 'flex', 
                    alignSelf: 'center', 
                    fontWeight: '700'}}>
                    {this.state.app_user.email}
                  </p>

                  <p style={{
                    display: 'flex', 
                    alignSelf: 'center', 
                    fontWeight: '300',
                    marginTop: '20px',
                    fontSize: '11px',
                    color: 'lightblue'
                  }}>

                  <Moment fromNow>
                    {this.state.app_user.last_visited_at}
                  </Moment>
                </p>

                <h3>Location</h3>

                <UserDataList>
                  <li>
                    <strong>referrer</strong>
                    <span>{this.state.app_user.referrer}</span>
                  </li>
                  
                  <li>
                    <strong>city</strong>
                    <span>{this.state.app_user.city}</span>
                  </li>
                  
                  <li>
                    <strong>region</strong>
                    <span>{this.state.app_user.region}</span>
                  </li>
                  
                  <li>
                    <strong>country</strong>
                    <span>{this.state.app_user.country}</span>
                  </li>
                  
                  <li>
                    <strong>lat</strong>
                    <span>{this.state.app_user.lat}</span>
                  </li>
                  
                  <li>
                    <strong>lng</strong>
                    <span>{this.state.app_user.lng}</span>
                  </li>
                </UserDataList>

                <h3>Browsing Properties</h3>
  
                <UserDataList>

                  <li>
                    <strong>postal:</strong> 
                    <span>{this.state.app_user.postal}</span>
                  </li>
                  
                  <li>
                    <strong>web sessions:</strong> 
                    <span>{this.state.app_user.web_sessions}</span>
                  </li>
                  
                  <li>
                    <strong>timezone:</strong> 
                    <span>{this.state.app_user.timezone}</span>
                  </li>
                  
                  <li>
                    <strong>browser version:</strong> 
                    <span>{this.state.app_user.browser_version}</span>
                  </li>

                  <li>
                    <strong>browser:</strong> 
                    <span>{this.state.app_user.browser}</span>
                  </li>
                  
                  <li>
                    <strong>os:</strong> 
                    <span>{this.state.app_user.os}</span>
                  </li>
                  
                  <li>
                    <strong>os version:</strong> 
                    <span>{this.state.app_user.os_version}</span>
                  </li>

                </UserDataList>

                <h3>Properties</h3>

                <UserDataList>
                  {
                    this.state.app_user.properties ? 
                    Object.keys(this.state.app_user.properties).map((o, i)=>{ 
                      return <li key={i}>
                                <strong>{o}:</strong>
                                <span>{this.state.app_user.properties[o]}</span>
                              </li>
                    }) : null
                  }
                </UserDataList>

              </Overflow>

            </GridElement>

          </Fragment>
  }
}