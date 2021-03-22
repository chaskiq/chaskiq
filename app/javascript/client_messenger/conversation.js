import React, { Component, Fragment } from 'react'
import { ThemeProvider } from 'emotion-theming'
import sanitizeHtml from 'sanitize-html'
import theme from './textEditor/theme'
import themeDark from './textEditor/darkTheme'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import styled from '@emotion/styled'
import Moment from 'react-moment'
import serialize from 'form-serialize'
import UnicornEditor from './textEditor'
import { isEmpty } from 'lodash'
import Loader from './loader'
import { toCamelCase } from './shared/caseConverter'
import ErrorBoundary from '../src/components/ErrorBoundary'
import autolink from './autolink'
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
  AppPackageBlockButtonItem,
  AppPackageBlockTextItem,
  ConversationEventContainer,
  InlineConversationWrapper,
  FooterAckInline,
  DisabledElement,
  NewConvoBtnContainer
} from './styles/styled'

import {
  DefinitionRenderer
} from '../src/components/packageBlocks/components'
import Button from '../src/components/Button'

const DanteStylesExtend = styled(DanteContainer)`
.graf--code{
  width: 242px;
  overflow: auto
}
`
export class Conversations extends Component {
  state = {
    loading: true
  }

  componentDidMount () {
    this.props.clearAndGetConversations({}, () => {
      this.setState({ loading: false })
    })

    this.props.updateHeader(
      {
        translateY: 0,
        opacity: 1,
        height: '0'
      }
    )
  }

  // TODO: skip on xhr progress
  handleConversationsScroll = (e) => {
    const element = e.target
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      if (this.props.conversationsMeta.next_page) { this.props.getConversations({ append: true }) }
    }
  }

  sanitizeMessageSummary = (message) => {
    if (!message) { return }

    const sanitized = sanitizeHtml(message)
    return sanitized.length > 100 ? `${sanitized.substring(0, 100)} ...` : sanitized
  }

  render () {
    const { t } = this.props

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
            this.props.conversations.map((o, _i) => {
              const message = o.lastMessage

              return <CommentsItemComp
                key={`comments-item-comp-${o.key}`}
                message={message}
                o={o}
                t={t}
                displayConversation={this.props.displayConversation}
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
            <NewConvoBtnContainer>
              <NewConvoBtn
                in={this.props.transition}
                onClick={this.props.displayNewConversation}>
                {t('create_new_conversation')}
              </NewConvoBtn>
            </NewConvoBtnContainer>
          }
        </ConversationsFooter>

      </div>
    </div>
  }
}

export class Conversation extends Component {
  componentDidMount () {
    this.props.updateHeader(
      {
        translateY: 0,
        opacity: 1,
        height: '0'
      }
    )

    this.wait_for_input = null

    this.inlineIframe = null
  }

  componentWillUnmount () {
    // todop porque?
    // if(!this.props.inline_conversation)
    //  this.props.clearConversation()
  }

  // TODO: skip on xhr progress
  handleConversationScroll = (e) => {
    if (this.props.disablePagination) return

    const element = e.target
    if (element.scrollTop === 0) { // on top
      const meta = this.props.conversation.messages.meta
      if (meta && meta.next_page) { this.props.setConversation(this.props.conversation.key) }
    } else {
      this.props.updateHeader(
        {
          translateY: 0,
          opacity: 1,
          height: 0
        }
      )
    }
  }

  appPackageBlockDisplay = (message) => {
    this.props.displayAppBlockFrame(message)
  }

  appPackageClickHandler = (item, message) => {
    // for new_conversation blocks
    if (message.message.blocks.type === 'ask_option' &&
    this.props.conversation.key === 'volatile') {
      return this.props.insertComment({
        conversation_key: this.props.conversation.key,
        message_key: message.key,
        trigger: message.message.triggerId,
        reply: item
      }, {
        before: () => {
          console.log('init conversation with ', item)
        },
        sent: () => {
          console.log('sent conversation', item)
        }
      })
    }

    if (message.message.blocks.type === 'app_package') { return this.appPackageBlockDisplay(message) }

    this.props.pushEvent('trigger_step', {
      conversation_key: this.props.conversation.key,
      message_key: message.key,
      trigger: message.triggerId,
      step: item.nextStepUuid || item.next_step_uuid,
      reply: item
    })
  }

  appPackageSubmitHandler = (data, message) => {
    this.props.pushEvent('receive_conversation_part',
      {
        conversation_key: this.props.conversation.key,
        message_key: message.key,
        step: message.stepId,
        trigger: message.triggerId,
        ...data
      })
  }

  renderTyping = () => {
    return <MessageItem>

      <div className="message-content-wrapper">
        <MessageSpinner>
          <div className={'bounce1'}/>
          <div className={'bounce2'}/>
          <div className={'bounce3'}/>
        </MessageSpinner>
        <span style={{
          fontSize: '0.7rem',
          color: '#afabb3'
        }}>
          {
            this.props.t('is_typing', {
              name: this.props.agent_typing.author.name || 'agent'
            })
          }
        </span>
      </div>

    </MessageItem>
  }

  isInputEnabled =() => {
    if (isEmpty(this.props.conversation.messages)) return true

    const messages = this.props.conversation.messages.collection
    if (messages.length === 0) return true

    const message = messages[0].message
    if (isEmpty(message.blocks)) return true
    if (message.blocks && message.blocks.type === 'wait_for_reply') return true

    // strict comparison of false
    if (message.blocks && message.blocks.wait_for_input === false) return true
    if (message.blocks && message.blocks.waitForInput === false) return true

    return message.state === 'replied'
  }

  renderInlineCommentWrapper = () => {
    return <div ref={comp => this.props.setOverflow(comp) }
      onScroll={this.handleConversationScroll}
      style={{
        overflowY: 'auto',
        height: '86vh',
        position: 'absolute',
        width: '100%',
        zIndex: '20'
      }}>
      <CommentsWrapper
        isReverse={true}
        isInline={this.props.inline_conversation}
        ref={comp => this.props.setInlineOverflow(comp)}
        isMobile={this.props.isMobile}>
        {this.renderMessages()}
      </CommentsWrapper>
    </div>
  }

  renderCommentWrapper = () => {
    return <CommentsWrapper
      isReverse={true}
      isMobile={this.props.isMobile}>
      {this.renderMessages()}
    </CommentsWrapper>
  }

  renderMessage = (o, _i) => {
    const userClass = o.appUser.kind === 'agent' ? 'admin' : 'user'
    const isAgent = o.appUser.kind === 'agent'
    const themeforMessage = o.privateNote || isAgent ? theme : themeDark
    const { t } = this.props

    return <MessageItemWrapper
      visible={this.props.visible}
      email={this.props.email}
      key={`conversation-${this.props.conversation.key}-item-${o.key}`}
      conversation={this.props.conversation}
      pushEvent={this.props.pushEvent}
      data={o}>

      <MessageItem
        className={userClass}
        messageSourceType={o.messageSource ? o.messageSource.type : ''}
        isInline={this.props.inline_conversation}
      >

        {
          !this.props.isUserAutoMessage(o) && isAgent
            ? <ConversationSummaryAvatar>
              <img src={o.appUser.avatarUrl} />
            </ConversationSummaryAvatar> : null
        }

        <div className="message-content-wrapper">

          {
            this.props.isUserAutoMessage(o)
              ? <UserAutoChatAvatar>
                <img src={o.appUser.avatarUrl} />
                <span>{o.appUser.name || '^'}</span>
              </UserAutoChatAvatar> : null
          }

          {/* render light theme on user or private note */}

          <ThemeProvider
            theme={ themeforMessage }>
            <DanteStylesExtend>
              <DraftRenderer
                message={o}
                domain={this.props.domain}
                raw={JSON.parse(o.message.serializedContent)}
              />

              <span className="status">
                {
                  o.readAt
                    ? <Moment fromNow>
                      {o.readAt}
                    </Moment> : <span>{t('not_seen')}</span>
                }
              </span>
            </DanteStylesExtend>
          </ThemeProvider>

        </div>

      </MessageItem>

    </MessageItemWrapper>
  }

  renderItemPackage = (o, i) => {
    return <AppPackageBlock
      key={`package-${o.key}-${i}`}
      message={o}
      isInline={this.props.inline_conversation}
      conversation={this.props.conversation}
      submitAppUserData={this.props.submitAppUserData.bind(this)}
      clickHandler={this.appPackageClickHandler.bind(this)}
      appPackageSubmitHandler={this.appPackageSubmitHandler}
      t={this.props.t}
      updatePackage={this.updatePackage}
      searcheableFields={this.props.appData.searcheableFields}
      displayAppBlockFrame={this.props.displayAppBlockFrame}
      getPackage={this.props.getPackage}
      // {...o}
    />
  }

  renderEventBlock = (o, _i) => {
    const { data, action } = o.message
    return <ConversationEventContainer
      isInline={this.props.inline_conversation}>
      <span>
        {this.props.t(`conversations.events.${action}`, data)}
      </span>
    </ConversationEventContainer>
  }

  renderMessages = () => {
    return <React.Fragment>
      {
        this.props.agent_typing && this.renderTyping()
      }

      {
        this.isInputEnabled() && this.props.conversation.messages &&
      this.props.conversation.messages.collection.length >= 3 &&
      <FooterAckInline>
        <a href="https://chaskiq.io" target="blank">
          <img src={`${this.props.domain}/logo-gray.png`}/> {this.props.t('runon')}
        </a>
      </FooterAckInline>
      }

      {
        this.props.conversation.messages &&
      this.props.conversation.messages.collection.map((o, i) => {
        if (o.message.blocks) return this.renderItemPackage(o, i)
        if (o.message.action) return this.renderEventBlock(o, i)
        return this.renderMessage(o, i)
      })
      }

    </React.Fragment>
  }

  renderReplyAbove = () => {
    if (this.props.inline_conversation) return null
    return this.props.t('reply_above')
  }

  handleBeforeSubmit = () => {
    const { messages } = this.props.conversation
    if (isEmpty(messages)) return
    const message = messages.collection[0]
    if (!message) return
    if (!message.message) return
    if (message.message.blocks && message.message.blocks.type === 'wait_for_reply') {
      this.wait_for_input = message
    }
  }

  handleSent = () => {
    if (!this.wait_for_input) return

    const message = this.wait_for_input

    this.props.pushEvent('receive_conversation_part',
      {
        conversation_key: this.props.conversation.key,
        message_key: message.key,
        step: message.stepId,
        trigger: message.triggerId
      // submit: data
      })

    this.wait_for_input = null
  }

  renderFooter = () => {
    return <Footer
      isInline={this.props.inline_conversation}
      isInputEnabled={this.isInputEnabled()}
      className={this.props.footerClassName || ''}>
      {
        !this.isInputEnabled()
          ? this.renderReplyAbove()
          : <UnicornEditor
            t={this.props.t}
            beforeSubmit={(data) => this.handleBeforeSubmit(data)}
            onSent={(data) => this.handleSent(data)}
            domain={this.props.domain}
            footerClassName={this.props.footerClassName }
            insertComment={this.props.insertComment}
          />
      }
    </Footer>
  }

  renderInline =() => {
    return <div>
      <EditorSection inline={true}>
        {this.renderInlineCommentWrapper()}
        {this.renderFooter()}
      </EditorSection>
    </div>
  }

  renderDefault = () => {
    return <div
      ref={comp => this.props.setOverflow(comp) }
      onScroll={this.handleConversationScroll}
      style={{ overflowY: 'auto', height: '100%' }}>

      <EditorSection>
        {this.renderCommentWrapper()}
        {this.renderFooter()}
      </EditorSection>

    </div>
  }

  render () {
    return <div style={{
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0'
    }}>

      {
        this.props.inline_conversation
          ? this.renderInline() : this.renderDefault()
      }
    </div>
  }
}

class MessageItemWrapper extends Component {
  componentDidMount () {
    // mark as read on first render if not read & from admin
    setTimeout(() => {
      this.sendEvent()
    }, 300)
  }

  componentDidUpdate (prevProps, _prevState) {
    if (prevProps && prevProps.visible != this.props.visible && this.props.visible) { this.sendEvent() }
  }

  sendEvent = () => {
    if (this.props.visible &&
      !this.props.data.volatile &&
      !this.props.data.readAt &&
      this.props.data.appUser.kind === 'agent') {
      this.props.pushEvent('receive_conversation_part',
        Object.assign({}, {
          conversation_key: this.props.conversation.key,
          message_key: this.props.data.key,
          step: this.props.stepId,
          trigger: this.props.triggerId
        }, { email: this.props.email })
      )
    }
  }

  render () {
    return <Fragment>
      {this.props.children}
    </Fragment>
  }
}

class AppPackageBlock extends Component {
  form = null

  state = {
    value: null,
    errors: {},
    loading: false,
    schema: this.props.message.message.blocks.schema,
    submiting: false
  }

  setLoading = (val) => {
    this.setState({ loading: val })
  }

  handleStepControlClick = (item) => {
    if (this.props.message.message.data && this.props.message.message.data.opener) { return window.open(this.props.message.message.data.opener) }

    this.setState({ submiting: true }, () => {
      this.props.clickHandler(item, this.props.message)
    })
  }

  sendAppPackageSubmit = (data, cb) => {
    // if(data.field.action && data.field.action.type === 'frame')
    //  this.props.clickHandler(data, this.props)
    this.updatePackage(data, this.props.message, cb)
  }

  updatePackage = (data, message, cb) => {
    if (data.field.action.type === 'url') {
      return window.open(data.field.action.url, '_blank')
    }

    if (data.field.action.type === 'frame') {
      // todo: handle get package :eyes
      this.props.displayAppBlockFrame({
        message: message,
        data: {
          field: data.field,
          id: message.message.blocks.app_package,
          values: message.message.blocks.values,
          message_key: message.key,
          conversation_key: this.props.conversation.key
        }
      })
      cb && cb()
      return
    }

    const camelCasedMessage = toCamelCase(message.message)

    const params = {
      id: camelCasedMessage.blocks.appPackage,
      hooKind: data.field.action.type,
      ctx: {
        field: data.field,
        conversation_key: this.props.conversation.key,
        message_key: message.key,
        definitions: camelCasedMessage.blocks.schema,
        step: this.props.stepId,
        trigger: this.props.triggerId,
        values: data.values || message.message.blocks.values
      }
    }

    // handle steps on appPackageSubmitHandler
    this.props.getPackage(params, (data, updateMessage) => {
      if (!data) { return cb && cb() }

      const { definitions, _kind, results } = data.messenger.app.appPackage.callHook

      if (!results) {
        // this.setState({schema: definitions}, cb && cb())
      } else {
        // this will hit messenger_events#receive_conversation_part
        this.props.appPackageSubmitHandler(
          {
            submit: results,
            definitions: definitions
          },
          message
        )
        // independly on the result of appPackageSubmit
        // we will update the state definitions on the block
        // maybe this will work on updating the message from ws ??
        // this.setState({schema: definitions}, cb && cb())
      }

      // update message from parent state
      const newMessage = this.props.message
      newMessage.message.blocks.schema = definitions
      updateMessage && updateMessage(newMessage)
      this.setState({ loading: false })
      cb && cb()
    })
  }

  // TODO: to be deprecated
  sendAppPackageSubmit2 = (e) => {
    if (this.state.loading) return

    this.setLoading(true)

    e.preventDefault()

    const data = serialize(e.currentTarget, { hash: true, empty: true })
    let errors = {}

    // check custom functions and validate
    Object.keys(data).map((o) => {
      const item = this.props.searcheableFields.find((f) => f.name === o)
      if (!item) return
      if (!item.validation) return

      var args = ['value', item.validation]
      var validationFunc = Function.apply(null, args)
      const err = validationFunc(data[o])
      if (!err) return
      if (err.length === 0) return
      errors = Object.assign(
        errors, { [o]: err })
    })

    this.setState({ errors: errors, loading: false }, () => {
      // console.log(this.state.errors)
      // console.log(isEmpty(this.state.errors) ? 'valid' : 'errors')
      if (!isEmpty(this.state.errors)) return
      this.props.appPackageSubmitHandler(data, this.props.message)
    })
  }

  renderEmptyItem = () => {
    if (this.props.message.message.blocks.type === 'app_package') {
      return <p>{this.props.message.message.blocks.app_package} replied</p>
    } else {
      return <p>mo</p>
    }
  }

  renderDisabledElement = () => {
    const item = this.props.message.message.data

    if (!item) return this.renderEmptyItem()

    switch (item.element) {
      case 'button':
        if (this.props.message.message.blocks.type === 'ask_option') {
          return <span dangerouslySetInnerHTML={{
            __html: this.props.t('conversation_block.choosen', { field: item.label })
          }}/>
        }

      default:
        const message = this.props.message.message
        const { blocks, data } = message

        if (this.props.message.message.blocks.type === 'app_package') {
          return <p>
            <strong>
              {blocks.app_package || blocks.appPackage}
            </strong>
            <br/>
            {
              data && <span
                dangerouslySetInnerHTML={
                  { __html: data.formatted_text || data.formattedText }
                }/>
            }
          </p>
        }

        if (this.props.message.message.blocks.type === 'data_retrieval') {
          return Object.keys(this.props.message.message.data).map((k) => {
            return <p key={`data-retrieval-${k}`}>{k}: {this.props.message.message.data[k]}</p>
          })
        } 
        //else {
        //  <p>{JSON.stringify(this.props.message.message.data)}</p>
        //}

        // falls through
    }
  }

  // TODO: deprecate this in favor of appPackagesIntegration
  // has depency on buttons
  renderElement = (item, index) => {
    const element = item.element
    const isDisabled = this.props.message.message.state === 'replied' || this.state.loading
    const { t } = this.props
    const key = `${item.type}-${index}`
    switch (element) {
      case 'separator':
        return <hr key={key}/>
      case 'input':
        const isEmailType = item.name === 'email' ? 'email' : null
        const errorClass = this.state.errors[item.name] ? 'error' : ''
        return <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '1.2em'
          }}
          className={`form-group ${errorClass}`}
          key={key}>
          <label>
            {t('enter_your', { field: item.name })}
          </label>
          <input
            disabled={isDisabled}
            type={isEmailType || item.type}
            name={`submit[${item.name}]`}
            required
            placeholder={t('enter_your', { field: item.name })}
            // onKeyDown={(e)=>{ e.keyCode === 13 ?
            //  this.handleStepControlClick(item) : null
            // }}
          />
          {
            this.state.errors[item.name] &&
                  <span className="errors">
                    {t('invalid', { name: item.name })}
                  </span>
          }
          <button disabled={isDisabled}
            key={key}
            style={{ alignSelf: 'flex-end' }}
            type={'submit'}>
            {t('submit')}
          </button>
        </div>

      case 'submit':
        return <Button disabled={isDisabled}
          key={key}
          style={{ alignSelf: 'flex-end' }}
          type={'submit'}>
          {t('submit')}
        </Button>
      case 'button':
        return <AppPackageBlockButtonItem>
          <Button
            // variant="outlined"
            disabled={isDisabled}
            onClick={() => this.handleStepControlClick(item)}
            key={key}
            type={'button'}>
            {item.label}
          </Button>
        </AppPackageBlockButtonItem>
      default:
        return null
    }
  }

  renderElements = () => {
    const isDisabled = this.props.message.message.state === 'replied'
    if (isDisabled) {
      return <DisabledElement>
        { this.renderDisabledElement() }
      </DisabledElement>
    }
    return <div className="elementsContainer">

      {
        this.props.message.message.blocks.label &&
      <AppPackageBlockTextItem dangerouslySetInnerHTML={
        { __html: autolink(this.props.message.message.blocks.label) }}
      />
      }

      {
        this.props.message.message.blocks.schema.map((o, i) =>
          this.renderElement(o, i)
        )
      }

    </div>
  }

  isHidden=() => {
    // will hide this kind of message since is only a placeholder from bot
    return this.props.message.message.blocks.type === 'wait_for_reply'
  }

  render () {
    const blocks = this.props.message.message.blocks
    return <AppPackageBlockContainer
      isInline={this.props.isInline}
      isHidden={this.isHidden()}>
      {
        blocks.type === 'app_package' &&
                <DefinitionRenderer
                  // schema={this.state.schema}
                  schema={blocks.schema}
                  updatePackage={
                    (data, cb) => this.sendAppPackageSubmit(data, cb)
                  }
                />
      }

      {
        blocks.type !== 'app_package' &&
                <form ref={o => (this.form = o) }
                  className="form"
                  onSubmit={ this.sendAppPackageSubmit2 }>
                  <fieldset disabled={this.state.submiting ? 'disabled' : '' }>
                    {
                      this.renderElements()
                    }
                  </fieldset>

                </form>
      }

    </AppPackageBlockContainer>
  }
}

export function CommentsItemComp (props) {
  const {
    displayConversation,
    message,
    o,
    t
  } = props

  const [display, setDisplay] = React.useState(false)

  function renderEventBlock (o) {
    const { data, action } = o.message
    return <span>
      <i>{t(`conversations.events.${action}`, data)}</i>
    </span>
  }

  function renderItemPackage (message) {
    switch (message.message.blocks.type) {
      case 'app_package':
        let namespace = 'app_package_wait_reply'
        const pkg = message.message.blocks.app_package
        if (pkg.wait_for_input === false || pkg.waitForInput === false) { namespace = 'app_package_non_wait' }

        return t(`conversations.message_blocks.${namespace}`)
          // falls through

        // return <span>{message.message.blocks.app_package}</span>
      case 'ask_option':
        return t('conversations.message_blocks.ask_option')
      case 'data_retrieval':
        return t('conversations.message_blocks.data_retrieval')
      default:
        return message.message.blocks.type
    }
  }

  function renderMessage (message) {
    var length = 80
    const d = JSON.parse(message.message.serializedContent)
    let string = ''
    if (!d) {
      string = message.message.htmlContent
    } else {
      string = d.blocks.map((block) => block.text).join('\n')
    }

    if (!string) return ''

    var trimmedString = string.length > length
      ? string.substring(0, length - 3) + '...'
      : string
    return trimmedString
  }

  function renderMessages (message) {
    if (message.message.blocks) return renderItemPackage(message)
    if (message.message.action) return renderEventBlock(message)
    return renderMessage(message)
  }

  React.useEffect(() => {
    const timeout = setTimeout(() => setDisplay(true), 400) // + (index * 100))

    // this cancell effect
    return function () {
      clearTimeout(timeout)
    }
  }, [])

  function renderAgentAvatar () {
    const a = agent()
    return a.avatarUrl
  }

  function agent () {
    if (message && message.appUser.kind === 'agent') return message.appUser
    if (o.assignee) return o.assignee
  }

  return <CommentsItem
    displayOpacity={display}
    key={`comments-item-${o.id}`}
    onClick={(e) => { displayConversation(e, o) }}>
    {
      message &&
                    <ConversationSummary>

                      <ConversationSummaryAvatar>
                        {
                          agent() && <img src={renderAgentAvatar()} />
                        }
                      </ConversationSummaryAvatar>

                      <ConversationSummaryBody>

                        <ConversationSummaryBodyMeta>
                          {
                            !message.readAt && message.appUser.kind != 'app_user'
                              ? <ReadIndicator /> : null
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

                        <ConversationSummaryBodyItems>
                          {
                            message.appUser && message.appUser.kind != 'agent'
                              ? <div className="you">{t('you')}:</div> : null
                          }

                          <ConversationSummaryBodyContent>
                            {
                              // dangerouslySetInnerHTML={
                              //  { __html: sanitizeMessageSummary(message.message.htmlContent) }
                              // }
                            }

                            <ErrorBoundary>
                              {renderMessages(message)}
                            </ErrorBoundary>

                          </ConversationSummaryBodyContent>

                        </ConversationSummaryBodyItems>

                      </ConversationSummaryBody>
                    </ConversationSummary>
    }
  </CommentsItem>
}

export function InlineConversation ({ conversation }) {
  return (

    <InlineConversationWrapper>
      hola {conversation.key}
    </InlineConversationWrapper>
  )
}
