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
    //console.log(this.props.match.path)
    const appId = this.props.match.params.appId
    return <RowColumnContainer>
            <ColumnContainer>
              
              <GridElement>
                <FixedHeader>ddd</FixedHeader>
                <FixedHeader style={{padding: '10px'}}>
                  ddd
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
                      {...props}
                    />
                )} /> 

            </ColumnContainer>
          </RowColumnContainer>
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
      this.conversationSubscriber()
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
          conversation: response.data.conversation,
          messages: response.data.messages
        }, ()=>{ 
          this.conversationSubscriber()
          this.getMainUser(this.state.conversation.main_participant.id) 
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
        email: "miguel2@preyhq.com",
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

  conversationSubscriber(){
    App.events = App.cable.subscriptions.create({
      channel: "ConversationsChannel",
      app: this.props.appId,
      id: this.state.conversation.id,
      email: "miguel2@preyhq.com",
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
          messages: this.state.messages.concat(data)
        }, this.scrollToLastItem )
      },
      notify: ()=>{
        console.log(`notify!!`)
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
                <FixedHeader>ddd</FixedHeader>
                <div className="overflow" ref="overflow">

                  {
                    this.state.messages.map( (o)=> {
                      return <MessageItem 
                                key={o.id}
                                message={o}
                              />
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

             <FixedHeader>ddd</FixedHeader>

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
                  fontWeight: '300'}}>

                  <Moment 
                    fromNow={this.state.app_user.last_visited_at}
                  />
                </p>

                <h3>Location</h3>

                <ul>
                  <li><strong>referrer</strong>
                    {this.state.app_user.referrer}
                  </li>
                  
                  <li>
                    <strong>city</strong>
                    {this.state.app_user.city}
                  </li>
                  
                  <li>
                    <strong>region</strong>
                    {this.state.app_user.region}
                  </li>
                  
                  <li>
                    <strong>country</strong>
                    {this.state.app_user.country}
                  </li>
                  
                  <li>
                    <strong>lat</strong>
                    {this.state.app_user.lat}
                  </li>
                  
                  <li>
                    <strong>lng</strong>
                    {this.state.app_user.lng}
                  </li>
                </ul>

                <h3>Browsing Properties</h3>
  
                <ul>

                  <li>
                    <strong>postal:</strong> 
                    { this.state.app_user.postal}
                  </li>
                  
                  <li>
                    <strong>web sessions:</strong> 
                    { this.state.app_user.web_sessions}
                  </li>
                  
                  <li>
                    <strong>timezone:</strong> 
                    { this.state.app_user.timezone}
                  </li>
                  
                  <li>
                    <strong>browser version:</strong> 
                    { this.state.app_user.browser_version}
                  </li>

                  <li>
                    <strong>browser:</strong> 
                    { this.state.app_user.browser}
                  </li>
                  
                  <li>
                    <strong>os:</strong> 
                    { this.state.app_user.os}
                  </li>
                  
                  <li>
                    <strong>os version:</strong> 
                    { this.state.app_user.os_version}
                  </li>

                </ul>

                <h3>Properties</h3>

                <ul>
                  {
                    this.state.app_user.properties ? 
                    Object.keys(this.state.app_user.properties).map((o, i)=>{ 
                      return <li key={i}>
                                <strong>{o}:</strong>
                                {this.state.app_user.properties[o]}
                              </li>
                    }) : null
                  }
                </ul>

              </Overflow>

            </GridElement>

          </Fragment>
  }
}