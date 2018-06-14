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

import './convo.css'

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
`;

class MessageItem extends Component {
  render(){
    return (
      <div>
        
        <img src={gravatar.url(this.props.message.app_user.email)} width={40} heigth={40}/>
        
        <span>
          {this.props.message.app_user.email}
        </span>
        
        <span dangerouslySetInnerHTML={
          {__html: this.props.message.message}
        }/>
        
        <Moment fromNow>
          {this.props.message.created_at}
        </Moment>
        
      </div>
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
                conversations

                {
                  this.state.conversations.map((o, i)=>{
                    return <li key={o.id}>
                            <div onClick={(e)=> this.props.history.push(`/apps/${appId}/conversations/${o.id}`) }>
                              <MessageItem message={o.last_message}/>
                            </div>
                           </li>
                  })
                }
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
        })
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

              <div style={{heigth: 200, overflow: 'auto'}}>

                {
                  this.state.messages.map( (o)=> {
                    return <MessageItem 
                              key={o.id}
                              message={o}
                            />
                  })
                }

              </div>
            
              <ConversationEditor 
                insertComment={this.insertComment}
              />

            </GridElement>

            <GridElement>
              <img src={gravatar.url(this.state.app_user.email)} 
                width={40} 
                heigth={40}
              />

              <p>{this.state.app_user.email}</p>
              <p>{this.state.app_user.state}</p>
              {
                Object.keys(this.state.app_user).map((o, i)=>{ 
                  return <p key={i}>
                          {o}:{this.state.app_user[o]}
                          </p>
                })
              }

            </GridElement>

          </Fragment>
  }
}