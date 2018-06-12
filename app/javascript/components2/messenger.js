import React, {Component, Fragment} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import actioncable from "actioncable"
import axios from "axios"
import styled from 'styled-components';
import Avatar from '@atlaskit/avatar';
import Button from '@atlaskit/button';
import {convertToHTML} from 'draft-convert'
//import Editor from './editor.js'
import UnicornEditor from './editor3.js'
//import Editor2 from './editor2.js'
//import {Editor} from '@atlaskit/editor-core';

// https://stackoverflow.com/questions/12114356/how-to-get-the-request-timezone
const App = {
  cable: actioncable.createConsumer()
}

const Container = styled.div`
  /* -ms- properties are necessary until MS supports the latest version of the grid spec */
  /* stylelint-disable value-no-vendor-prefix, declaration-block-no-duplicate-properties */
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: auto 1fr;
  /* stylelint-enable */
  grid-template:
    'avatar-area editor-area'
    / auto 1fr;
  padding-top: 16px;
  position: relative;

  &:first-child,
  &:first-of-type {
    padding-top: 0;
  }
`;

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
  bottom: 0px;
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
    min-height: 100px;
    overflow: auto;
    max-height: 250px;
`

const CommentsItem = styled.div`
    padding: 5px;
    background-color: #ccc;
`


class Messenger extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversation: null,
      conversation_messages: [],
      conversations: [],
      display_mode: "conversations"
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
      this.conversationSubscriber()
      this.getConversations()
    })
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

  conversationSubscriber(){
    App.events = App.cable.subscriptions.create({
      channel: "ConversationsChannel",
      app: this.props.app_id,
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
        this.setState({
          conversation_messages: this.state.conversation_messages.concat(data)
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

  ping(cb){
    axios.post(`/api/v1/apps/${this.props.app_id}/ping`, {
        user_data: {
          referrer: window.location.path,
          email: this.props.email,
          properties: this.props.properties
        }
      })
      .then(function (response) {
        console.log("subscribe to events")
        cb()
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

    if(this.state.conversation){
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
    this.setState({
      conversation: null,
      conversation_messages: [],
      display_mode: "conversation"
    })
  }

  displayConversationList(e){
    e.preventDefault()
    this.setState({
      display_mode: "conversations"
    })
  }

  displayConversation(e, o){
    this.setconversation(o.id, ()=>{

      this.setState({
        display_mode: "conversation"
      }, ()=> this.getConversations() )
    })
  }


  render(){
    return <EditorWrapper>
                <Container>
                  <AvatarSection>
                    <Avatar
                      name={this.props.email}
                      size="medium"
                      src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                        this.props.email,
                      )}.png`}
                    />
                  </AvatarSection>

                  {
                    this.state.display_mode === "conversation" ? 
                      <EditorSection>

                        
                        Hello {this.props.name}!
                        {this.props.app_id}
                        
                        <a href="#" onClick={this.displayConversationList.bind(this)}>
                          back
                        </a>

                        <CommentsWrapper>
                          {
                            this.state.conversation_messages.map((o,i)=>{
                              return <CommentsItem  
                                        key={i}
                                        dangerouslySetInnerHTML={{__html: o.message}} 
                                     />
                            })
                          }
                        </CommentsWrapper>
                        
                        <UnicornEditor 
                          insertComment={this.insertComment}
                        />
                      </EditorSection> : null
                  } 

                  {
                    this.state.display_mode === "conversations" ? 
                      <div>
                        <CommentsWrapper>
                          {
                            this.state.conversations.map((o,i)=>{
                              console.log("this", this)
                              const t = this
                              return <CommentsItem key={o.id}
                                      onClick={(e)=>{t.displayConversation(e, o)}}> 
                                      {o.id} 
                                      {o.created_at} 
                                     </CommentsItem>
                            })
                          }
                        </CommentsWrapper>

                        <a href="#" onClick={this.displayNewConversation.bind(this)}>
                          create new conversation
                        </a>
                      </div>
                     : null 
                  }

                </Container>
              
           </EditorWrapper>
  }
}

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