import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from 'emotion-theming'
import sanitizeHtml from 'sanitize-html';
import theme from './textEditor/theme'
import themeDark from './textEditor/darkTheme'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import Moment from 'react-moment';
import serialize from 'form-serialize'
import UnicornEditor from './textEditor'
import {isEmpty} from 'lodash'
import Loader from './loader'
import {
  EditorSection,
  CommentsWrapper,
  CommentsItem,
  Footer,
  ReadIndicator,
  MessageItem,
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
  MessageSpinner,
  AppPackageBlockContainer,
  ConversationEventContainer,
} from './styles/styled'

export class Conversations extends Component {

  state = {
    loading: true
  }

  componentDidMount(){

    this.props.clearAndGetConversations({}, ()=>{
      this.setState({loading: false})
    })

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
        this.props.getConversations({ append: true }, )
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
            this.state.loading && <Loader sm/>
          }
          {
            this.props.conversations.map((o, i) => {

              const message = o.lastMessage

              return <CommentsItemComp
                key={`comments-item-comp-${o.key}`}
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

export class Conversation extends Component {

  componentDidMount(){
    this.props.updateHeader(
      {
        translateY: 0 , 
        opacity: 1, 
        height: '0' 
      }
    )
  }

  componentWillUnmount(){
    if(!this.props.inline_conversation)
      this.props.clearConversation()
  }

  // TODO: skip on xhr progress
  handleConversationScroll = (e) => {

    if(this.props.disablePagination) return
    
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
      if (this.props.conversation.messages.meta.next_page)
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

  renderMessage = (o, i)=>{
    const userClass = o.appUser.kind === "agent" ? 'admin' : 'user'
    const isAgent = o.appUser.kind === "agent"
    const themeforMessage = o.privateNote || isAgent ? theme : themeDark
    const {t} = this.props
    return <MessageItemWrapper
            visible={this.props.visible}
            email={this.props.email}
            key={`conversation-item-${o.id}`}
            conversation={this.props.conversation}
            pushEvent={this.props.pushEvent}
            data={o}>

              <MessageItem
                className={userClass}
                messageSourceType={o.messageSource ? o.messageSource.type : ''}
              >

              {
                !this.props.isUserAutoMessage(o) && isAgent ?
                <ConversationSummaryAvatar>
                  <img src={o.appUser.avatarUrl} />
                </ConversationSummaryAvatar> : null
              }

              <div className="message-content-wrapper">

                {
                  this.props.isUserAutoMessage(o) ?
                    <UserAutoChatAvatar>
                      <img src={o.appUser.avatarUrl} />
                      <span>{o.appUser.name || '^'}</span>
                    </UserAutoChatAvatar> : null
                }

                {/*render light theme on user or private note*/}
                
                <ThemeProvider 
                  theme={ themeforMessage }>
                  <DanteContainer>
                    <DraftRenderer 
                      key={i}
                      message={o}
                      domain={this.props.domain}
                      raw={JSON.parse(o.message.serializedContent)}
                    />

                    <span className="status">
                      {
                        o.readAt ?
                          <Moment fromNow>
                            {o.readAt}
                          </Moment> : <span>{t("not_seen")}</span>
                      }
                    </span>
                  </DanteContainer>
                </ThemeProvider>  

              </div>

            </MessageItem>
            
          </MessageItemWrapper>
  }

  renderItemPackage = (o, i)=>{
    return  <AppPackageBlock 
               key={`package-${this.props.conversation.key}-${i}`}
               message={o}
               conversation={this.props.conversation}
               submitAppUserData={this.props.submitAppUserData.bind(this)}
               clickHandler={this.appPackageClickHandler.bind(this)}
               appPackageSubmitHandler={this.appPackageSubmitHandler.bind(this)}
               t={this.props.t}
               {...o}
              />
  }

  renderEventBlock = (o, i)=>{
    const {data, action} = o.message
    return <ConversationEventContainer>
            <span>
              {this.props.t(`conversations.events.${action}`, data)}
            </span>
           </ConversationEventContainer>
  }

  appPackageBlockDisplay = (message)=>{
    this.props.displayAppBlockFrame(message)
  }

  appPackageClickHandler = (item, message)=>{
    // run app block display here! refactor
    if (message.message.blocks.type === "app_package") return this.appPackageBlockDisplay(message)
    this.props.pushEvent('trigger_step', {
      conversation_id: this.props.conversation.key,
      message_id: message.id,
      trigger: message.triggerId,
      step: item.nextStepUuid || item.next_step_uuid,
      reply: item
    })
    
  }

  appPackageSubmitHandler = (data, message)=>{
    this.props.pushEvent("receive_conversation_part", 
      {
        conversation_id: this.props.conversation.key,
        message_id: message.id,
        step: this.props.stepId,
        trigger: this.props.TriggerId,
        submit: data
      })
  }

  renderTyping = ()=>{
    return <MessageItem>

            <div className="message-content-wrapper">
              <MessageSpinner>
                <div className={"bounce1"}/>
                <div className={"bounce2"}/>
                <div className={"bounce3"}/>
              </MessageSpinner>
              <span style={{
                fontSize: '0.7rem', 
                color: '#afabb3'}}>
                {this.props.agent_typing.author.name || 'agent'}
                is typing
              </span>
            </div>

           </MessageItem>
  }

  isInputEnabled =()=>{
    
    if(isEmpty(this.props.conversation.messages)) return true
    
    const messages = this.props.conversation.messages.collection
    if( messages.length === 0 ) return true
    
    const message = messages[0].message
    if(isEmpty(message.blocks)) return true
    return message.state === "replied"
  }

  render(){

    const {t} = this.props
    //console.log("ENABLED???", this.isInputEnabled())
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
              this.props.agent_typing && this.renderTyping()
            }

            {
              this.props.conversation.messages && this.props.conversation.messages.collection.map((o, i) => {
                  if(o.message.blocks) return this.renderItemPackage(o, i)
                  if(o.message.action) return this.renderEventBlock(o, i)
                  return this.renderMessage(o, i)
              })
            }

          </CommentsWrapper>

          <Footer className={this.props.footerClassName || ''}>
          
            {
              !this.isInputEnabled() ? t("reply_above") : 
              <UnicornEditor
                domain={this.props.domain}
                footerClassName={this.props.footerClassName }
                insertComment={this.props.insertComment}
              />
            }
            
          </Footer>

        </EditorSection>

      </div>
    </div>
  }

}

class MessageItemWrapper extends Component {
  componentDidMount(){
    // mark as read on first render if not read & from admin
    this.sendEvent()
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps && prevProps.visible != this.props.visible && this.props.visible)
      this.sendEvent()
  }

  sendEvent = ()=>{
    if(this.props.visible && !this.props.data.volatile && !this.props.data.readAt && this.props.data.appUser.kind === "agent"){
      this.props.pushEvent("receive_conversation_part", 
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
        if (this.props.message.blocks.type === "ask_option"){
          return <p>choosen: {item.label}</p>
        }
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
    const {t} = this.props
    switch(item.element){
    case "separator":
      return <hr key={index}/>
    case "input":
      return <div className={"form-group"} key={index}>
              <label>{t("enter_your", {field: item.name })}</label>
              <input 
                disabled={isDisabled}
                type={item.type} 
                name={item.name}
                placeholder={t("enter_your", {field: item.name })}
                //onKeyDown={(e)=>{ e.keyCode === 13 ? 
                //  this.handleStepControlClick(item) : null
                //}}
              />
              <button disabled={isDisabled}
                      key={index} 
                      style={{alignSelf: 'flex-end'}} 
                      type={"submit"}>
                {t("submit")}
              </button>
             </div>

    case "submit":
      return <button disabled={isDisabled}
                     key={index} 
                     style={{alignSelf: 'flex-end'}} 
                     type={"submit"}>
          {t("submit")}
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


export function CommentsItemComp(props){

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

  function renderAgentAvatar(){
    const a = agent()
    return a.avatarUrl
  }

  function agent(){
    if(message && message.appUser.kind === "agent") return message.appUser
    if(o.assignee) return o.assignee
  }

  return <CommentsItem
                displayOpacity={display}
                key={`comments-item-${o.id}`}
                onClick={(e) => { displayConversation(e, o) }}>

                {
                  message ?
                    <ConversationSummary>

                      <ConversationSummaryAvatar>
                        {
                          agent() && <img src={renderAgentAvatar()} />
                        }
                      </ConversationSummaryAvatar>

                      <ConversationSummaryBody>

                        <ConversationSummaryBodyMeta>
                          {
                            !message.readAt && message.appUser.kind != "app_user" ?
                              <ReadIndicator /> : null
                          }
                          <Autor>
                            {agent() && agent().displayName}
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
                        <ConversationSummaryBodyItems>
                          {
                            message.appUser && message.appUser.kind != "agent" ? 
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