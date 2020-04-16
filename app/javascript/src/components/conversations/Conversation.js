import React, { Component, Fragment } from 'react'

import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { ThemeProvider } from 'emotion-theming'
import Tooltip from 'rc-tooltip'

import graphql from '../../graphql/client'
import { last } from 'lodash'
import Moment from 'react-moment'
import { toCamelCase } from '../../shared/caseConverter'
import ConversationEditor from './Editor.js'

import {
  getConversation,
  typingNotifier,
  insertComment,
  insertAppBlockComment,
  insertNote,
  setLoading,
  clearConversation,
  appendMessage,
  updateConversationState,
  updateConversationPriority,
  assignAgent
} from '../../actions/conversation'

import { AGENTS } from '../../graphql/queries'

import { CheckmarkIcon, PinIcon, LeftArrow } from '../icons'
import Dropdown from '../Dropdown'
import { getAppUser } from '../../actions/app_user'

import FilterMenu from '../FilterMenu'

import theme from '../textEditor/theme'
import themeDark from '../textEditor/darkTheme'
import EditorContainer from '../textEditor/editorStyles'
import DraftRenderer from '../textEditor/draftRenderer'
import styled from '@emotion/styled'
import { setCurrentPage, setCurrentSection } from '../../actions/navigation'
import Button from '../../components/Button'

const EditorContainerMessageBubble = styled(EditorContainer)`
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
`

function Conversation ({
  dispatch,
  conversation,
  match,
  app,
  current_user,
  events
}) {
  const overflow = React.useRef(null)

  const matchId = match ? match.params.id : null

  const messagesLength = conversation.collection
    ? conversation.collection.length
    : null

  const { mainParticipant } = conversation

  const [agents, setAgents] = React.useState([])

  console.log('LENGHT:', messagesLength)

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
    setTimeout(() => {
      scrollToLastItem()
    }, 10)
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
    const element = e.target
    if (element.scrollTop === 0) {
      // on top
      if (conversation.meta.next_page && !conversation.loading) {
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

    console.log('AAAA', opts)

    const lastItem = last(conversation.collection)

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

  const renderMessage = (o, userOrAdmin) => {
    const message = o
    const messageContent = o.message
    const key = `conversation-${conversation.id}-message-${o.id}`
    // return userOrAdmin === "admin" ?
    // console.log("KEYKEY:", key)

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

    return <div
      id={`message-id-${message.id}`}
      className={`flex items-start py-2 text-sm ${flow}`}
      key={`conversations-messages/${message.id}`}>
      <img
        alt={message.appUser.displayName}
        src={message.appUser.avatarUrl}
        className={`w-10 h-10 rounded ${avatarM}`}
      />
      <div
        className={`${bgClass}
        shadow-lg 
        flex-1 
        overflow-hidden p-3 
        rounded-md`}
      >
        <div className="flex justify-between pb-4">
          <span className={`font-bold ${textClass}`}>
            {message.appUser.displayName}
          </span>
          <span className={`text-xs ${textClass}`}>
            <Moment fromNow ago>
              {message.createdAt}
            </Moment>

            <span className={textClass}>
              {' - '}
              {message.readAt ? (
                <span>{'seen '}</span>
              ) : message.privateNote ? (
                'NOTE'
              ) : (
                <span>not seen</span>
              )}
            </span>
          </span>
        </div>

        <EditorContainerMessageBubble>
          {content}
        </EditorContainerMessageBubble>
      </div>
    </div>
  }

  const renderBlockRepresentation = (block) => {
    const { blocks, data } = block.message
    // TODO: display labels, schema buttons
    switch (blocks.type) {
      case 'app_package':
        return (
          <div>
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
        )
      case 'ask_option':
        return <p>ask option</p>
      case 'data_retrieval':
        return <p>data retrieval</p>
      default:
        return ''
    }
  }

  const renderBlocks = (o) => {
    const block = toCamelCase(o)
    const { blocks, data } = block.message
    const message = o
    const messageContent = o.message

    if (o.message.state !== 'replied') {
      return renderBlockRepresentation(block)
    }

    const item = o.message.data
    if (!item) return 'replied'

    // if(!o.fromBot) return

    let blockElement 

    switch (item.element) {
      case 'button':
        blockElement =
          <p>
            <strong>reply button:</strong>
            {item.label}
          </p>
        
        break
      default:
        if (blocks.type === 'app_package') {
          /* return Object.keys(o.message.data).map((k)=>{
            const val = o.message.data[k]
            if(typeof(val) != "string") return
            return <p>{k}: {val}</p>
          }) */

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

        if (o.message.blocks.type === 'data_retrieval') {
          const dataList = Object.keys(o.message.data).map((k) => {
            return (
              <p>
                {k}: {o.message.data[k]}
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
          blockElement = <p>{JSON.stringify(o.message.data)}</p>
          break
        }
    }

    return (
      <div
        id={`message-id-${message.id}`}
        className={`flex items-start py-2 text-sm`}
        key={`conversations-messages/${message.id}`}>

        <div
          className={`bg-gray-100
          flex 
          overflow-hidden p-2 
          rounded-md mx-auto`
          }
        >
          <div className="flex flex-col justify-between">

            <span className={`text-xs text-center`}>
              <Moment fromNow ago>
                {message.createdAt}
              </Moment>

              <span>
                {' - '}
                {
                  message.readAt ? <span>{'seen '}</span>
                    : <span>not seen</span>
                }
              </span>
            </span>

            <p className="text-xs text-center text-bold">
              {blockElement}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderEventBlock = (o) => {

    const message = o
    const messageContent = o.message

    return (
      <div
        id={`message-id-${message.id}`}
        className={`flex items-start py-2 text-sm`}
        key={`conversations-messages/${message.id}`}>

        <div
          className={`bg-gray-100
          flex 
          overflow-hidden p-2 
          rounded-md mx-auto`
          }
        >
          <div className="flex flex-col justify-between">

            <span className={`text-xs text-center`}>
              <Moment fromNow ago>
                {message.createdAt}
              </Moment>

              <span>
                {' - '}
                {
                  message.readAt ? <span>{'seen '}</span>
                    : <span>not seen</span>
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

  if (conversation.collection) {
    console.log(conversation.collection.map((o) => o.id))
  }

  return (
    <BgContainer className="flex-1 flex flex-col bg-white overflow-hidden--">
      <div className="border-b flex px-6 py-2 items-center flex-none bg-white">
        <div className="flex">
          <Link
            to={`/apps/${app.key}/conversations`}
            className="block md:hidden">
            <LeftArrow/>
          </Link>
          <h3 className="mb-1 text-grey-darkest">
            conversation with{' '}
            <span className="font-extrabold">
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
            overlay={conversation.state === 'closed' ? 'reopen' : 'close'}
          >
            <button
              onClick={() => {
                const option =
                  conversation.state === 'closed' ? 'reopen' : 'close'
                updateConversationStateDispatch(option)
              }}
              aria-label={conversation.state === 'closed' ? 'reopen' : 'close'}
              className="mr-1 rounded-full bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow"
            >
              <CheckmarkIcon variant="rounded" />
            </button>
          </Tooltip>

          <Tooltip
            placement="bottom"
            overlay={
              !conversation.priority
                ? 'Priorize conversation'
                : 'Remove priority'
            }
          >
            <button
              onClick={toggleConversationPriority}
              aria-label={
                !conversation.priority
                  ? 'Priorize conversation'
                  : 'Remove priority'
              }
              className="mr-1 rounded-full bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow"
            >
              <PinIcon variant="rounded" />
            </button>
          </Tooltip>

          <FilterMenu
            options={agents}
            value={conversation.assignee ? conversation.assignee.email : ''}
            filterHandler={(data) => setAgent(data.id)}
            triggerButton={(cb) => {
              return (
                <Tooltip placement="bottom" overlay={'assign agent'}>
                  <div onClick={cb} className="flex-shrink-0 h-10 w-10">
                    {conversation.assignee && (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={conversation.assignee.avatarUrl}
                        alt={conversation.assignee.name}
                      />
                    )}
                  </div>
                </Tooltip>
              )
            }}
          />
        </div>
      </div>

      <div
        ref={overflow}
        className="flex flex-col-reverse px-6 py-4 overflow-y-scroll"
        onScroll={handleScroll}
        style={{
          height: 'calc(100vh - 226px)'
        }}
      >
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
                key={`message-item-${conversation.key}-${message.id}`}
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
                      ? renderBlocks(message, userOrAdmin)
                      : message.message.action
                        ? renderEventBlock(message, userOrAdmin)
                        : renderMessage(message, userOrAdmin)
                  }
                </ThemeProvider>
              </MessageItemWrapper>
            )
          })}
      </div>

      <div className="pb-3 px-4 flex-none">
        <div className="bg-white flex rounded-lg border-2 border-grey overflow-hidden shadow-lg">
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
    </BgContainer>
  )
}

function MessageItemWrapper ({ conversation, data, events, children }) {
  React.useEffect(() => {
    // mark as read on first render
    if (!data.readAt) {
      events &&
        events.perform(
          'receive_conversation_part',
          Object.assign(
            {},
            {
              conversation_id: conversation.id,
              message_id: data.id
            },
            { email: data.email }
          )
        )
    }
  }, [])

  return <React.Fragment>{children}</React.Fragment>
}

function mapStateToProps (state) {
  const { auth, app, conversation, app_user, current_user } = state
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
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Conversation))
