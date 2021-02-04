import React from 'react'

import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThemeProvider } from 'emotion-theming'
import Tooltip from 'rc-tooltip'

import graphql from '../../graphql/client'
import { last } from 'lodash'
import Moment from 'react-moment'
import { toCamelCase } from '../../shared/caseConverter'
import ConversationEditor from './Editor.js'
import Rtc from '../rtc'
import { updateRtcEvents } from '../../actions/rtc'
import Progress from '../Progress'
import Button from '../Button'
import I18n from '../../shared/FakeI18n'
import tw from 'twin.macro'
import { DefinitionRenderer } from '../packageBlocks/components'
import {
  getConversation,
  typingNotifier,
  insertComment,
  insertAppBlockComment,
  insertNote,
  clearConversation,
  updateConversationState,
  updateConversationPriority,
  assignAgent,
  setLoading,
  updateConversationTagList
} from '../../actions/conversation'

import QuickRepliesDialog from './QuickReplyDialog'
import ErrorBoundary from '../ErrorBoundary'

import { successMessage } from '../../actions/status_messages'

import {
  appendConversation
} from '../../actions/conversations'

import { AGENTS } from '../../graphql/queries'

import {
  getPackage
} from '../packageBlocks/utils'

import {
  CheckmarkIcon,
  PinIcon,
  LeftArrow,
  CallEnd,
  Call,
  LabelIcon,
  MoreIcon
} from '../icons'

import { getAppUser } from '../../actions/app_user'
import { toggleDrawer } from '../../actions/drawer'

import FilterMenu from '../FilterMenu'
import theme from '../textEditor/theme'
import themeDark from '../textEditor/darkTheme'
import EditorContainer from '../textEditor/editorStyles'
import DraftRenderer from '../textEditor/draftRenderer'
import styled from '@emotion/styled'
import { setCurrentPage, setCurrentSection } from '../../actions/navigation'
import RtcDisplayWrapper, { ModalWrapper } from '../../../client_messenger/rtcView' // './RtcWrapper'
import TagDialog from '../TagDialog'

const EditorContainerMessageBubble = styled(EditorContainer)`
  //display: flex;
  //justify-content: center;

  // this is to fix the image on message bubbles
  .aspect-ratio-fill {
    display: none;
  }
  .aspectRatioPlaceholder.is-locked .graf-image {
    position: inherit;
  }
`

const BgContainer = styled.div`
  //background-color: #DFDBE5;
  background-image: radial-gradient(currentColor 2px, transparent 2px),radial-gradient(currentColor 2px, transparent 2px);
  background-size: calc(20 * 2px) calc(20 * 2px);
  background-position: 0 0,calc(10 * 2px) calc(10 * 2px);
`

const MessageItem = styled.div`
  ${(props) => props.userOrAdmin === 'user'
    ? tw`bg-white text-green-500` : props.privateNote
      ? tw`bg-yellow-300 text-black`
      : tw`bg-gray-700 text-white`

  // `background: linear-gradient(45deg,#48d79b,#1dea94f2);` :
  // `background: linear-gradient(45deg,#202020,#000000e6)`
  }
`

function Conversation ({
  dispatch,
  conversation,
  match,
  app,
  current_user,
  drawer,
  events,
  toggleFixedSidebar,
  fixedSidebarOpen
}) {
  const overflow = React.useRef(null)

  const matchId = match ? match.params.id : null

  const messagesLength = conversation.collection
    ? conversation.collection.length
    : null

  const { mainParticipant } = conversation

  const [agents, setAgents] = React.useState([])
  const [scrolling, setScrolling] = React.useState(false)
  const [rtcAudio, setRtcAudio] = React.useState(true)
  const [rtcVideo, setRtcVideo] = React.useState(true)
  const [expand, setExpand] = React.useState(false)
  const [videoSession, setVideoSession] = React.useState(false)
  const [openTagManager, setOpenTagManager] = React.useState(false)
  const [quickReplyDialogOpen, setQuickReplyDialogOpen] = React.useState(false)
  const appId = app.key

  React.useEffect(() => {
    getAgents((data) => {
      setAgents(data)
    })
  }, [])

  React.useEffect(() => {
    if (!matchId) return

    dispatch(
      clearConversation(() => {
        getMessages(scrollToLastItem)
      })
    )

    dispatch(setCurrentPage('Conversations'))

    dispatch(setCurrentSection('Conversations'))
  }, [matchId])

  React.useEffect(() => {
    if (!mainParticipant) return
    setAppUser(mainParticipant.id)
  }, [mainParticipant])

  React.useEffect(() => {
    if (!scrolling) {
      scrollToLastItem()
    }
    setScrolling(false)
  }, [messagesLength])

  const insertCommentDispatch = (comment, cb) => {
    dispatch(
      insertComment(comment, () => {
        cb && cb()
      })
    )
  }

  const insertNoteDispatch = (comment, cb) => {
    dispatch(
      insertNote(comment, () => {
        cb && cb()
      })
    )
  }

  const insertAppBlockCommentDispatch = (data, cb) => {
    dispatch(
      insertAppBlockComment(data, () => {
        cb && cb()
      })
    )
  }

  const setAppUser = (id) => {
    dispatch(getAppUser(id))
  }

  const handleScroll = (e) => {
    if (conversation.loading) return
    const element = e.target
    if (element.scrollTop === 0) {
      // on top
      if (conversation.meta.next_page && !conversation.loading) {
        setScrolling(true)
        getMessages((item) => {
          scrollToItem(item)
        })
      }
    }
  }

  const scrollToItem = (item) => {
    if (item) {
      overflow.current.scrollTop = document.querySelector(
        `#message-id-${item}`
      ).offsetHeight
    } else {
      scrollToLastItem()
    }
  }

  const scrollToLastItem = () => {
    if (!overflow.current) return
    overflow.current.scrollTop = overflow.current.scrollHeight
  }

  const getMessages = (cb) => {
    const opts = {
      id: matchId
    }

    const lastItem = last(conversation.collection)

    dispatch(setLoading(true))
    dispatch(
      getConversation(opts, () => {
        // this.getMainUser(this.state.conversation.mainParticipant.id)
        // TODO: this will scroll scroll to last when new items
        // are added on pagination (scroll up)!
        cb && cb(lastItem ? lastItem.id : null)
      })
    )
  }

  const typingNotifierDispatch = (cb) => {
    dispatch(
      typingNotifier(() => {
        cb && cb()
      })
    )
  }

  const updateConversationStateDispatch = (state, cb) => {
    dispatch(
      updateConversationState(state, (data) => {
        cb && cb(data.updateConversationState.conversation)
      })
    )
  }

  const toggleConversationPriority = (e, cb) => {
    dispatch(
      updateConversationPriority((data) => {
        cb && cb(data.updateConversationState.conversation)
      })
    )
  }

  const getAgents = (cb) => {
    graphql(
      AGENTS,
      { appKey: appId },
      {
        success: (data) => {
          cb(data.app.agents)
        },
        error: (error) => {}
      }
    )
  }

  const setAgent = (id, cb) => {
    dispatch(assignAgent(id, cb))
  }

  const addAsReply = (content) => {
    setQuickReplyDialogOpen(content)
  }

  const renderMessage = (o, userOrAdmin) => {
    const message = o
    const messageContent = o.message
    const key = `conversation-${conversation.key}-message-${o.key}`

    const content = messageContent.serializedContent ? (
      <DraftRenderer
        key={key}
        raw={JSON.parse(messageContent.serializedContent)}
        html={messageContent.htmlContent}
      />
    ) : (
      <div
        key={key}
        dangerouslySetInnerHTML={{
          __html: messageContent.htmlContent
        }}
      />
    )

    let textClass = userOrAdmin === 'admin' ? 'text-gray-100' : ''
    const flow = userOrAdmin === 'admin' ? 'flex-row-reverse' : ''
    const avatarM = userOrAdmin === 'admin' ? 'ml-3' : 'mr-3'
    let bgClass =
    userOrAdmin === 'admin' ? 'bg-black' : 'bg-green-100'
    if (message.privateNote) {
      bgClass = 'bg-yellow-300'
      textClass = 'text-gray-900'
    }

    const isAdmin = userOrAdmin === 'admin'

    return <div
      id={`message-id-${message.key}`}
      className={`flex items-start py-2 text-sm ${flow}`}
      key={`conversations-messages/${message.key}`}>
      {
        userOrAdmin === 'user' && <img
          alt={message.appUser.displayName}
          src={message.appUser.avatarUrl}
          onClick={handleUserSidebar}
          className={`cursor-pointer w-10 h-10 rounded ${avatarM}`}
        />
      }
      <MessageItem
        userOrAdmin={userOrAdmin}
        privateNote={message.privateNote}
        className={`
        shadow sm:rounded-lg
        flex-1 
        p-3 
        max-w-full`}
      >
        <div className="flex justify-between pb-4">
          <div className="flex items-center">
            <span className={`font-bold ${textClass}`}>
              {message.appUser.displayName}
            </span>
          </div>
          <span className={`flex items-center text-xs ${textClass}`}>
            <Moment fromNow ago>
              {message.createdAt}
            </Moment>

            <span className={textClass}>
              {' - '}
              {message.readAt ? (
                <span>{I18n.t('conversation.messages.seen')}</span>
              ) : message.privateNote ? (
                I18n.t('conversation.messages.note')
              ) : (
                <span>{I18n.t('conversation.messages.not_seen')}</span>
              )}
            </span>

            {
              isAdmin && messageContent.serializedContent &&

              <FilterMenu
                options={[
                  {
                    title: I18n.t('quick_replies.add_as_dialog.title'),
                    onClick: () => { addAsReply(messageContent.serializedContent) }
                  }
                ]}
                value={null}
                filterHandler={(e) => e.onClick && e.onClick() }
                triggerButton={(handler) => (
                  <Button
                    variant="icon"
                    onClick={handler}
                    className="ml-2">
                    <MoreIcon className="text-gray-400"/>
                  </Button>
                )}
                position={'right'}
                origin={'bottom-0'}
              />
            }

          </span>
        </div>

        <EditorContainerMessageBubble>
          {content}
        </EditorContainerMessageBubble>
      </MessageItem>
    </div>
  }

  const renderEventBlock = (o) => {
    const message = o
    const messageContent = o.message

    return (
      <div
        id={`message-id-${message.id}`}
        className={'flex items-start py-2 text-sm'}
        key={`conversations-messages/${message.id}`}>

        <div
          className={`bg-yellow-300
          flex 
          overflow-hidden p-2 
          rounded-md mx-auto`
          }
        >
          <div className="flex flex-col justify-between">

            <span className={'text-xs text-center'}>
              <Moment fromNow ago>
                {message.createdAt}
              </Moment>

              <span>
                {' - '}
                {
                  message.readAt ? <span>{I18n.t('conversation.messages.seen')}</span>
                    : <span>{I18n.t('conversation.messages.not_seen')}</span>
                }
              </span>
            </span>

            <p className="text-md text-center font-bold">
              {messageContent.action} {messageContent.data.name || messageContent.data.email}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleUserSidebar = () => {
    dispatch(toggleDrawer({ userDrawer: !drawer.userDrawer }))
  }

  const updateTags = (tags) => {
    dispatch(updateConversationTagList({
      id: conversation.id,
      tagList: tags,
      appKey: app.key
    }, () => {
      dispatch(successMessage('tags updated'))
      setOpenTagManager(false)
    }))
  }

  return (
    <BgContainer className="flex-1 flex flex-col overflow-hidden-- h-screen">
      <div className="border-b flex px-6 py-3 items-center flex-none bg-white">
        <div className="flex items-center">
          <Link
            to={`/apps/${app.key}/conversations`}
            className="block md:hidden">
            <LeftArrow/>
          </Link>

          {
            conversation.mainParticipant &&
            !fixedSidebarOpen &&
            <img onClick={handleUserSidebar}
              className="h-9 w-9 rounded-full mr-2 cursor-pointer"
              src={conversation.mainParticipant.avatarUrl}
              alt=""
            />
          }
          <h3 className="mb-1 text-xs text-grey-darkest">
            {I18n.t('conversation.with')}{' '}
            <br/>
            <span className="font-extrabold hover:text-underline"
              onClick={toggleFixedSidebar}
              // onClick={handleUserSidebar}
            >
              {
                conversation.mainParticipant &&
                conversation.mainParticipant.displayName
              }
            </span>
          </h3>
        </div>

        <div className="ml-auto flex">
          {/*
            <div className="relative">
              <input type="search" placeholder="Search" className="appearance-none border border-grey rounded-lg pl-8 pr-4 py-2"/>
              <div className="absolute pin-y pin-l pl-3 flex items-center justify-center">
                <svg className="fill-current text-grey h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"></path>
                </svg>
              </div>
              </div>
          */}

          <Tooltip
            placement="bottom"
            overlay={
              I18n.t(`conversation.actions.${conversation.state === 'closed' ? 'reopen' : 'close'}`)
            }
          >
            <button
              onClick={() => {
                const option =
                  conversation.state === 'closed' ? 'reopen' : 'close'
                updateConversationStateDispatch(option)
              }}
              aria-label={I18n.t(`conversation.actions.${conversation.state === 'closed' ? 'reopen' : 'close'}`)}
              className={`focus:outline-none 
                outline-none 
                mr-1 rounded-full 
                ${
                  conversation.state === 'closed'
                  ? 'bg-green-600 border-green-700 hover:bg-green-700 hover:border-green-800 text-gray-100'
                  : 'bg-white hover:bg-gray-100 text-gray-800'
                }
                 
                font-semibold 
                border 
                rounded shadow`
              }
            >
              <CheckmarkIcon variant="rounded" />
            </button>
          </Tooltip>

          <Tooltip
            placement="bottom"
            overlay={
              I18n.t(`conversation.actions.${videoSession ? 'end_call' : 'start_call'}`)
            }
          >
            <button
              className="focus:outline-none outline-none mr-1 rounded-full bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow"
              onClick={() => setVideoSession(!videoSession)}>
              { videoSession ? <CallEnd variant="rounded"/> : <Call variant="rounded"/> }
            </button>
          </Tooltip>

          <ModalWrapper expanded={expand} videoSession={videoSession}>

            <RtcDisplayWrapper
              videoSession={videoSession}
              relativePosition={true}
              toggleVideo={() => setRtcVideo(!rtcVideo)}
              toggleAudio={() => setRtcAudio(!rtcAudio)}
              rtcVideo={rtcVideo}
              rtcAudio={rtcAudio}
              expand={expand}
              setExpand={setExpand}
              setVideoSession={() => setVideoSession(!videoSession)}
            />
          </ModalWrapper>

          <div id="button-element" className="hidden"></div>

          {
            events && <Rtc
              buttonElement={'button-element'}
              callInitiatorElement={'callInitiator'}
              callButtonsElement={'callButtons'}
              infoElement={'info'}
              localVideoElement={'localVideo'}
              remoteVideoElement={'remoteVideo'}
              handleRTCMessage={(data) => { debugger }}
              onCloseSession={() => updateRtcEvents({}) }
              toggleVideoSession={ () => setVideoSession(!videoSession)}
              toggleVideo={() => setRtcVideo(!rtcVideo)}
              toggleAudio={() => setRtcAudio(!rtcAudio)}
              video={videoSession}
              rtcVideo={rtcVideo}
              rtcAudio={rtcAudio}
              events={events}
            />
          }

          <Tooltip
            placement="bottom"
            overlay={
              I18n.t(`conversation.actions.${!conversation.priority ? 'priorize' : 'remove_priority'}`)
            }
          >
            <button
              onClick={toggleConversationPriority}
              aria-label={
                I18n.t(`conversation.actions.${!conversation.priority ? 'priorize' : 'remove_priority'}`)
              }
              className="focus:outline-none outline-none mr-1 rounded-full bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow"
            >
              <PinIcon variant="rounded" />
            </button>
          </Tooltip>

          <Tooltip
            placement="bottom"
            overlay={
              'tag conversation'
            }
          >
            <button
              onClick={() => setOpenTagManager(true)}
              aria-label={
                'tag conversation'
              }
              className="focus:outline-none outline-none mr-1 rounded-full bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow"
            >
              <LabelIcon variant="rounded" />
            </button>
          </Tooltip>

          {
            openTagManager &&
                <TagDialog
                  title={'manage conversation tags'}
                  tags={conversation.tagList}
                  saveHandler={(tags) => updateTags(tags)}
                  closeHandler={() => setOpenTagManager(false)}>

                </TagDialog>
          }

          <FilterMenu
            options={agents.map(o => ({
              key: o.email,
              name: o.name || o.email,
              id: o.id
            }))}
            value={conversation.assignee ? conversation.assignee.email : ''}
            filterHandler={(data) => setAgent(data.id)}
            position={'right'}
            origin={'top-50'}
            triggerButton={(cb) => {
              return (
                <Tooltip placement="bottom"
                  overlay={
                    I18n.t('conversation.actions.assign_agent')
                  }
                >
                  <div onClick={cb}
                    className="flex flex-shrink-0 h-10 w-10 mr-1 rounded-full
                    bg-white hover:bg-gray-100 text-gray-800 font-semibold
                    border border-gray-400 rounded shadow items-center justify-center">
                    {conversation.assignee && (
                      <img
                        className="h-6 w-6 rounded-full"
                        src={conversation.assignee.avatarUrl}
                        alt={conversation.assignee.name}
                      />
                    )}
                  </div>
                </Tooltip>
              )
            }}
          />

          {
            !fixedSidebarOpen &&
            <div className="flex items-center text-gray-300"
              style={{
                marginRight: '-30px',
                marginLeft: '16px'
              }}>
              <Button
                variant="clean"
                className="hidden md:block"
                onClick={ toggleFixedSidebar }>
                <LeftArrow/>
              </Button>
            </div>
          }

        </div>
      </div>

      <div
        ref={overflow}
        className="overflow-y-scroll"
        onScroll={handleScroll}
        style={{
          height: 'calc(100vh - 220px)'
        }}>
        <div
          className="flex flex-col-reverse px-6 py-4">
          <ErrorBoundary>
            {conversation &&
              conversation.collection &&
              conversation.collection.map((message) => {
                const isReplied = message.message.state === 'replied'
                const userOrAdmin =
                  !isReplied && message.appUser && message.appUser.kind === 'agent'
                    ? 'admin'
                    : 'user'
                const appuserId = conversation.mainParticipant.id

                return (
                  <MessageItemWrapper
                    key={`message-item-${conversation.key}-${message.key}`}
                    data={message}
                    events={events}
                    conversation={conversation}
                    email={current_user.email}
                  >

                    <ThemeProvider
                      theme={
                        userOrAdmin === 'admin'
                          ? message.privateNote
                            ? theme
                            : themeDark
                          : theme
                      }
                    >

                      {
                        message.message.blocks
                          ? <RenderBlocks
                            conversation={conversation}
                            message={message}
                            userOrAdmin={userOrAdmin}
                            app={app}
                            dispatch={dispatch}
                          />
                          : message.message.action
                            ? renderEventBlock(message, userOrAdmin)
                            : renderMessage(message, userOrAdmin)
                      }
                    </ThemeProvider>
                  </MessageItemWrapper>
                )
              })}

            {
              conversation.loading &&
                <div className="m-2">
                  <Progress size="4"/>
                </div>
            }
          </ErrorBoundary>
        </div>
      </div>

      <div className="pb-3 px-4 flex-none mt-auto">
        <div className="bg-white flex rounded-lg border border-grey overflow-hidden shadow-lg">
          {/* <span className="text-3xl text-grey border-r-2 border-grey p-2">
              <svg className="fill-current h-6 w-6 block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z"></path></svg>
              </span> */}

          <ConversationEditor
            data={{}}
            app={app}
            insertAppBlockComment={insertAppBlockCommentDispatch}
            insertComment={insertCommentDispatch}
            typingNotifier={typingNotifierDispatch}
            insertNote={insertNoteDispatch}
          />

          {/* <input type="text" className="w-full px-4" placeholder="Message #general"/> */}
        </div>
      </div>

      <QuickRepliesDialog
        title={ I18n.t('quick_reply.add_as_dialog.title') }
        closeHandler={
          () => setQuickReplyDialogOpen(null)
        }
        open={quickReplyDialogOpen}>
      </QuickRepliesDialog>

    </BgContainer>
  )
}

function MessageItemWrapper ({ conversation, data, events, children }) {
  React.useEffect(() => {
    // mark as read on first render
    setTimeout(sendRead, 300)
  }, [])

  function sendRead () {
    if (!data.readAt) {
      events &&
        events.perform(
          'receive_conversation_part',
          Object.assign(
            {},
            {
              conversation_key: conversation.key,
              message_key: data.key
            },
            { email: data.email }
          )
        )
    }
  }

  return <React.Fragment>{children}</React.Fragment>
}

function RenderBlocks ({ message, userOrAdmin, app, conversation, dispatch }) {
  const { data, blocks } = toCamelCase(message).message

  const schema = blocks.schema
  // will update package
  const updatePackage = (data, cb) => {
    // for now the only supported action for agent facing pkg will be the url link

    if (data.field.action.type === 'url') {
      return window.open(data.field.action.url, '_blank')
    }

    const params = {
      id: blocks.appPackage,
      appKey: app.key,
      hooKind: data.field.action.type,
      ctx: {
        conversation_key: conversation.key,
        field: data.field,
        definitions: [data.field.action],
        location: 'inbox',
        values: data.values
      }
    }

    getPackage(params, 'conversation', (data) => {
      const definitions = data.app.appPackage.callHook.definitions
      const newMessage = message
      newMessage.message.blocks.schema = definitions
      dispatch(appendConversation(newMessage))
      cb && cb()
    })
  }

  const renderBlockRepresentation = () => {
    const { data } = message.message
    // TODO: display labels, schema buttons
    let output = null
    switch (blocks.type) {
      case 'app_package':

        output = <div>
          <div
            className="text-gray-800 text-xs
            font-bold uppercase tracking-wide">
            <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full
            text-xs font-light bg-green-100 text-green-800 md:mt-2 lg:mt-0">
              <span>
                {blocks.appPackage}
              </span>
            </div>
          </div>

          <br />

          <DefinitionRenderer
            schema={schema}
            values={blocks.values}
            updatePackage={updatePackage}
          />
        </div>
        break
      case 'ask_option':
        output = <p>ask option</p>
        break
      case 'data_retrieval':
        output = <p>data retrieval</p>
        break
      default: null
    }

    return (

      <div
        style={{
          opacity: 0.96
        }}
        className={`
        w-full
        bg-white
        opacity-75
        border
        border-gray-400
        shadow-lg
        flex 
        overflow-hidden p-2 
        rounded-md mx-auto
        text-gray-600`
        }
      >
        <div className="w-full flex flex-col justify-between">
          {output}
        </div>

      </div>

    )
  }

  if (blocks.type === 'app_package') {
    // (o.message.state !== 'replied') {

    return <div
      id={`message-id-${message.id}`}
      className={'flex items-start py-2 text-sm'}
      key={`conversations-messages/${message.id}`}>
      {
        renderBlockRepresentation()
      }
    </div>
  }

  const item = message.message.data
  if (!item) {
    return <p className="text-sm leading-5 font-medium text-gray-500 py-2 flex justify-center">
      <a href="#" className="relative inline-flex items-center rounded-full border border-gray-400 px-3 py-0.5 text-sm bg-white">
        <span className="absolute flex-shrink-0 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-200 border border-black" 
            aria-hidden="true">
          </span>
        </span>
        <span className="ml-3.5 font-medium text-gray-700">waiting for reply</span>
      </a>

    </p>
  }

  let blockElement

  switch (item.element) {
    case 'button':
      blockElement =
        <p>
          <strong>
          reply button:
          </strong> {item.label}
        </p>

      break
    default:
      if (blocks.type === 'app_package') {
        blockElement = <div>
          <p variant="overline">{blocks.appPackage}</p>

          <br />

          <p variant={'caption'}>
            {data && (
              <span
                dangerouslySetInnerHTML={{ __html: data.formattedText }}
              />
            )}
          </p>
        </div>

        break
      }

      if (blocks.type === 'data_retrieval') {
        const dataList = Object.keys(message.message.data).map((k) => {
          return (
            <p>
              {k}: {message.message.data[k]}
            </p>
          )
        })

        blockElement =
          <React.Fragment>
            <strong>replied:</strong>
            {dataList}
          </React.Fragment>
        break
      } else {
        blockElement = <p>{JSON.stringify(message.message.data)}</p>
        break
      }
  }

  return (
    <div
      id={`message-id-${message.id}`}
      className={'flex items-start py-2 text-sm'}
      key={`conversations-messages/${message.id}`}>

      <div
        className={`bg-green-400
        flex 
        overflow-hidden p-2 
        rounded-md mx-auto text-white`
        }
      >
        <div className="flex flex-col justify-between">

          <span className={'text-xs text-center'}>
            <Moment fromNow ago>
              {message.createdAt}
            </Moment>

            <span>
              {' - '}
              {
                message.readAt ? <span>{I18n.t('conversation.messages.seen')}</span>
                  : <span>{I18n.t('conversation.messages.not_seen')}</span>
              }
            </span>
          </span>

          <p className="text-md text-center text-bold">
            {blockElement}
          </p>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  const { auth, app, conversation, app_user, current_user, drawer } = state
  const { isAuthenticated } = auth
  const { messages, loading } = conversation
  const { jwt } = auth

  return {
    jwt,
    conversation,
    current_user,
    messages,
    loading,
    app_user,
    app,
    drawer,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Conversation))
