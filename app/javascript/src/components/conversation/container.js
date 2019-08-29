import React, {Component, Fragment} from 'react'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import gravatar from "../../shared/gravatar"
import {ThemeProvider} from 'emotion-theming'

import graphql from "../../graphql/client"
import {last} from 'lodash'
import Moment from 'react-moment';

import { 
    AGENTS
} from "../../graphql/queries"

import {
  GridElement,
  ChatContainer,
  HeaderTitle,
  ConversationButtons,
  FixedHeader,
  ChatMessageItem,
  ChatAvatar,
  StatusItem
} from './styles'

import Progress from '../../shared/Progress'
import OptionMenu from './optionMenu'
import FilterMenu from './filterMenu'

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check'
import InboxIcon from '@material-ui/icons/Inbox'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

import theme from './theme'
import themeDark from './darkTheme'
import EditorContainer from './editorStyles'

import ConversationEditor from './Editor.js'
import {getConversation, 
  insertComment, 
  insertNote,
  setLoading,
  clearConversation,
  appendMessage,
  updateConversationState,
  updateConversationPriority,
  assignAgent
} from '../../actions/conversation'

import { camelCase, isEmpty } from 'lodash';

import DraftRenderer from '../../textEditor/draftRenderer'

class ConversationContainerShow extends Component {

  constructor(props){
    super(props)
    this.state = {
      appUser: {},
      subscription: false
    }

    this.fetching = false
  }

  componentDidMount(){
    this.getMessages( this.scrollToLastItem )
  }

  componentDidUpdate(PrevProps, PrevState){
    if(PrevProps.match && PrevProps.match.params.id !== this.props.match.params.id){
        this.props.dispatch(clearConversation( ()=>{
          this.getMessages(this.scrollToLastItem )
        }))
    }

    if( PrevProps.conversation.collection && this.props.conversation.collection.length != PrevProps.conversation.collection.length){
      this.scrollToLastItem()
    }
  }

  handleScroll = (e) => {
    let element = e.target
    if (element.scrollTop === 0) { // on top
      if (this.props.conversation.meta.next_page && !this.props.conversation.loading)
        this.getMessages( (item)=> {
          this.scrollToItem(item)
       })
    }
  }

  scrollToItem = (item)=>{
    if(item){
      this.refs.overflow.scrollTop = document.querySelector(`#message-id-${item}`).offsetHeight
    }else{
      this.scrollToLastItem()
    }
  }

  scrollToLastItem = ()=>{
    if(!this.refs.overflow) return
    this.refs.overflow.scrollTop = this.refs.overflow.scrollHeight;
  }

  getMessages = (cb)=>{
    const opts = {id: this.props.match.params.id } 

    const lastItem = last(this.props.conversation.collection)

    this.props.dispatch(getConversation(opts, ()=>{
      //this.getMainUser(this.state.conversation.mainParticipant.id)
      // TODO: this will scroll scroll to last when new items 
      // are added on pagination (scroll up)!
      cb ? cb(lastItem ? lastItem.id : null) : null
    }))
  }

  insertComment = (comment, cb)=>{
    this.props.dispatch(insertComment(comment, ()=>{
      cb ? cb() : null
    }))
  }

  insertNote = (comment, cb)=>{
    this.props.dispatch(insertNote(comment, ()=>{
      cb ? cb() : null
    }))
  }

  getAgents = (cb)=>{
    graphql(AGENTS, {appKey: this.props.appId }, {
      success: (data)=>{
        cb(data.app.agents)
      }, 
      error: (error)=>{

      }
    })
  }

  setAgent = (id, cb)=>{
    this.props.dispatch(
      assignAgent(id, cb)
    )
  }

  updateConversationState = (state, cb)=>{
    this.props.dispatch(updateConversationState(state, ()=>{
      cb ? cb(data.updateConversationState.conversation) : null
    }))
  }

  toggleConversationPriority = (e, cb)=>{
    this.props.dispatch(updateConversationPriority(()=>{
      cb ? cb(data.updateConversationState.conversation) : null
    }))
  }

  render(){
    return <Fragment>
          
            <GridElement grow={2}>

              {
                this.props.conversation.id ?
              
                <ChatContainer>
                  
                  <FixedHeader>
                    
                    <HeaderTitle>
                      Conversation with {" "}

                      {
                        this.props.conversation.mainParticipant ? 
                        <b>{this.props.conversation.mainParticipant.displayName}</b> 
                        : null
                      }

                    </HeaderTitle>

                    <ConversationButtons>

                      <OptionMenu 
                        getAgents={this.getAgents.bind(this)}
                        setAgent={this.setAgent.bind(this)}
                        conversation={this.props.conversation}
                      />

                      {
                        this.props.conversation.state != "closed" ?
                        <Tooltip title="Close conversation">
                          <IconButton onClick={()=>{ this.updateConversationState("close")}}>
                            <CheckIcon/>
                          </IconButton>
                        </Tooltip> : null
                      }

                      {
                        this.props.conversation.state != "opened" ?
                        <Tooltip title="Reopen conversation">
                          <IconButton onClick={()=>{ this.updateConversationState("reopen")}}>
                            <InboxIcon/>
                          </IconButton>
                        </Tooltip> : null
                      }

                      <Tooltip title={ !this.props.conversation.priority ? "Priorize conversation" : 'Remove priority'}>
                        <IconButton onClick={this.toggleConversationPriority}>
                          <PriorityHighIcon 
                            color={this.props.conversation.priority ? 'primary' : 'inherit' }
                          />
                        </IconButton>
                      </Tooltip>


                    </ConversationButtons>

                  </FixedHeader>

                    <div className="box-container" style={{
                      paddingTop: '10px'
                    }}>

                      <div className="overflow" 
                          ref="overflow" 
                          onScroll={this.handleScroll}
                          style={{
                            //boxShadow: 'inset 0px 1px 3px 0px #ccc',
                            //background: 'aliceblue',
                            flexDirection : 'column-reverse',
                            display: 'flex',
                            height: `calc(100vh - 462px)`
                          }}>

                        {
                          this.props.conversation.collection.map( (o, i)=> {

                            const userOrAdmin = o.appUser.kind === 'agent' ? 'admin' : 'user'
               
                            return <MessageItemWrapper 
                                      key={`message-item-${this.props.conversation.key}-${o.id}`} 
                                      data={o} 
                                      events={this.props.events}
                                      conversation={this.props.conversation}
                                      email={this.props.current_user.email}>

                                      <ChatMessageItem 
                                        id={`message-id-${o.id}`}
                                        message={o}
                                        className={userOrAdmin}>
                                        
                                        <ChatAvatar 
                                          onClick={(e)=>this.props.showUserDrawer(o.appUser.id)}
                                          className={userOrAdmin}>

                                          <img src={gravatar(o.appUser.email)}/>

                                        </ChatAvatar>

                                        <ThemeProvider theme={
                                          userOrAdmin === "admin" ? 
                                          o.privateNote ? theme : themeDark 
                                          : theme 
                                        }>
                                          <EditorContainer>

                                            {
                                              userOrAdmin === "admin" ?
                                              
                                              <DraftRenderer key={i} 
                                                raw={JSON.parse(o.message.serializedContent)}
                                              /> : 
                                            
                                              <div  
                                                key={i}
                                                dangerouslySetInnerHTML={{
                                                  __html:  o.message.htmlContent
                                                }} 
                                              /> 
                                            }

                                          </EditorContainer>
                                       </ThemeProvider>

                                        <StatusItem>

                                          <Moment fromNow>
                                            {o.createdAt}
                                          </Moment>
                                          {" - "}
                                          {
                                            o.readAt ? 
                                              <span>
                                                {"seen "}
                                                <Moment fromNow>
                                                  {o.readAt}
                                                </Moment>
                                              </span> : 
                                                
                                              o.privateNote ? 
                                              'NOTE' : <span>not seen</span>
                                              
                                          }
                                        </StatusItem>
                                        
                                      </ChatMessageItem>

                                    </MessageItemWrapper>
                                  })
                        }

                        {this.props.loading ? <Progress/> : null }

                      </div>

                      <div className="input">
                        
                        <ConversationEditor 
                          data={{}}
                          app={this.props.app}
                          insertComment={this.insertComment}
                          insertNote={this.insertNote}
                        />

                      </div>

                    </div>

                </ChatContainer> : <Progress/>
             }

            </GridElement>

              {
                /*
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

                */
              }

          </Fragment>
  }
}

class MessageItemWrapper extends Component {
  componentDidMount(){
    // console.log(this.props.data.readAt ? "yes" : "EXEC A READ HERE!")
    // mark as read on first render
    if(!this.props.data.readAt){
      //console.log(this.props.email)
      this.props.events && this.props.events.perform("receive_conversation_part", 
        Object.assign({}, {
          conversation_id: this.props.conversation.id,
          message_id: this.props.data.id
        }, {email: this.props.email})
      )
      /*App.conversations.perform("receive", 
        Object.assign({}, this.props.data, {email: this.props.email})
      )*/
    }
  }
  render(){
    return <Fragment>
            {this.props.children}
           </Fragment>
  }
}


function mapStateToProps(state) {

  const { auth, app, conversation, app_user , current_user} = state
  const { isAuthenticated } = auth
  const { messages, loading } = conversation
  const {jwt} = auth

  return {
    jwt,
    conversation,
    current_user,
    messages,
    loading,
    app_user,
    app,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(ConversationContainerShow))
