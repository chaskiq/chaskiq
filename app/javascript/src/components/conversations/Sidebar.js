import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Moment from 'react-moment'
import {
  LabelIcon,
  LeftArrow
} from '../icons'
import { updateApp } from '../../actions/app'
import AppInserter from './AppInserter'
import Button from '../Button'
import ErrorBoundary from '../ErrorBoundary'

import {
  APP_PACKAGE_HOOK
} from '../../graphql/queries'

import graphql from '../../graphql/client'

import {
  DefinitionRenderer
} from '../packageBlocks/components'

function localeDate (date) {
  return new Date(date).toLocaleString()
}

function Sidebar ({
  app,
  conversation,
  app_user,
  dispatch,
  toggleFixedSidebar
}) {
  const [editable, setEditable] = React.useState(false)

  const participant = conversation.mainParticipant
  if (!participant) { return null }

  function update (data, cb) {
    dispatch(
      updateApp(data.app, (d) => {
        console.log(d)
        cb && cb(d)
      })
    )
  };

  return (
    <div className="xl:border-r xl:border-gray-200">
      <div className="py-2 pt-2">
        <div className="flex items-center justify-between">

          {
            editable &&
            <div className="flex flex-col w-full">

              <div className="px-2">
                <AppInserter
                  app={app}
                  update={update}
                  setEditable={setEditable}
                  option={
                    {
                      name: 'inbox apps',
                      namespace: 'inboxApps',
                      n: 'inbox_apps',
                      classes: 'rounded-l-lg'
                    }
                  }
                  customRenderer={(data) => <div>
                    {
                      renderInternal({
                        object: data, app_user, conversation, app
                      })
                    }
                  </div>
                  }
                  capability={'inbox'}
                />
              </div>
            </div>
          }

          { !editable &&
            <div className="flex-1 space-y-8 break-all">
              <div className="space-y-8 sm:space-y-0 sm:flex
              sm:justify-between sm:items-center xl:block
              xl:space-y-2">

                <div className="px-2 space-y-2">
                  <div className="flex justify-between">
                    <div className="text-sm leading-5 font-bold text-gray-900">
                      <Button
                        variant="clean"
                        onClick={ toggleFixedSidebar }>
                        <LeftArrow/>
                      </Button>
                    </div>
                    <button className="text-sm leading-5 font-bold text-gray-900 hover:text-indigo-500"
                      onClick={() => setEditable(true) }>
                      customize
                    </button>
                  </div>

                  <div className="hidden flex-- items-center space-y-2 rounded-md border border-gray-200 bg-white w-full p-2">

                    {/* <div className="flex-shrink-0 h-12 w-12">
                      <img className="h-12 w-12 rounded-full"
                        src={participant.avatarUrl}
                        alt=""
                      />
                    </div>

                    <div className="space-y-1 ml-2">
                      <div className="text-sm leading-5 font-bold text-gray-900">
                        {participant.displayName}
                      </div>
                      { participant.email &&
                          <a href="#" className="group flex items-center space-x-2.5">
                            <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium">
                              {participant.email}
                            </div>
                          </a>
                      }
                    </div> */}

                    {/* <div className="flex flex-col space-y-3 sm:space-y-0 sm:space-x-3 sm:flex-row xl:flex-col xl:space-x-0 xl:space-y-3">
                      <span className="inline-flex rounded-md shadow-sm">
                        <Link
                          className="w-full inline-flex items-center justify-center
                          px-4 py-1 border border-transparent text-sm leading-5
                          font-medium rounded-md text-white bg-indigo-600
                          hover:bg-indigo-500 focus:outline-none
                          focus:border-indigo-700 focus:shadow-outline-indigo
                          active:bg-indigo-700 transition ease-in-out duration-150"
                          to={`/apps/${app.key}/users/${participant.id}`}>
                          {I18n.t('conversation.sidebar.show_profile')}
                        </Link>
                      </span>
                    </div> */}

                  </div>

                  {app.inboxApps && app.inboxApps.map((object, index) => (
                    <AppItem
                      key={`inboxApp-${object.name}-${index}`}
                      app={app}
                      object={object}
                      conversation={conversation}
                      app={app}
                      app_user={app_user}
                    />
                  ))}

                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

function renderInternal ({ object, conversation, app, app_user }) {
  switch (object.name) {
    case 'UserBlock':
      return <UserBlock conversation={conversation} app={app} app_user={app_user}/>
    case 'TagBlocks':
      return <TagBlocks conversation={conversation} app={app}/>
    case 'ConversationBlock':
      return <ConversationBlock conversation={conversation} app={app}/>
    case 'AssigneeBlock':
      return <AssigneeBlock conversation={conversation} app={app}/>
    default:
      break
  }
}

function UserBlock ({ conversation, app, app_user }) {
  return <div
    className="space-y-2 divide-y divide-gray-200">
    <div className="space-y-1 py-2">
      <div className="text-sm leading-5 font-medium text-gray-900">
        {I18n.t('conversation.sidebar.browser')}
      </div>

      <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium">
        {app_user.browser} {app_user.browserVersion}
        {' '} ({app_user.os} {app_user.osVersion})
      </div>
    </div>

    <div className="space-y-1 py-2">
      <div className="text-sm leading-5 font-medium text-gray-900">
        {I18n.t('conversation.sidebar.browser')}
      </div>

      <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium">
        {app_user.browser} {app_user.browserVersion}
        {' '} ({app_user.os} {app_user.osVersion})
      </div>
    </div>

    <div className="space-y-1 py-2">
      <div className="text-sm leading-5 font-medium text-gray-900">
        {I18n.t('conversation.sidebar.location')}
      </div>

      <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium">
        {[app_user.city, app_user.region, app_user.country].join(' ')}
      </div>
    </div>

  </div>
}

function TagBlocks ({ conversation, app }) {
  return <div className="">
    <span className="text-sm leading-5 font-medium text-gray-500">tags</span>
    { conversation.tagList.length > 0 &&
      <div className="flex items-center space-y-2 rounded-md border border-gray-200 bg-white w-full p-2">
        <div className="flex items-center space-x-2">
          <LabelIcon className="h-5 w-5 text-gray-400"/>
          <span className="text-sm text-gray-500 leading-5 font-medium">
            {conversation.tagList.map((tag) => `#${tag}`).join(', ')}
          </span>
        </div>
      </div>
    }
  </div>
}

function ConversationBlock ({ conversation, app }) {
  return <div className="space-y-2 divide-y divide-gray-200">
    <div className="space-y-2 pt-2">
      <dt className="text-sm leading-5 font-medium text-gray-500">
        {
          I18n.t('conversation.sidebar.latest_user_visible_comment_at')
        }
      </dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900">
        { conversation.latestUserVisibleCommentAt &&
          <React.Fragment>
            { localeDate(conversation.latestUserVisibleCommentAt) }
            {' '}
            (<Moment fromNow ago>
              { Date.parse(conversation.latestUserVisibleCommentAt) }
            </Moment>)
          </React.Fragment>
        }
      </dd>
    </div>

    <div className="space-y-2 pt-2">
      <dt className="text-sm leading-5 font-medium text-gray-500">
        {
          I18n.t('conversation.sidebar.first_agent_reply')
        }
      </dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900">
        { conversation.firstAgentReply &&
          <React.Fragment>
            {localeDate(conversation.firstAgentReply)}
            {' '}
            (<Moment fromNow ago>
              { Date.parse(conversation.firstAgentReply) }
            </Moment>)
          </React.Fragment>
        }
      </dd>
    </div>

    <div className="space-y-2 pt-2">
      <dt className="text-sm leading-5 font-medium text-gray-500">
        {
          I18n.t('conversation.sidebar.created_at')
        }
      </dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900">
        { conversation.createdAt &&
          <React.Fragment>
            {localeDate(conversation.createdAt)}
            {' '}
            (<Moment fromNow ago>
              { Date.parse(conversation.createdAt) }
            </Moment>)
          </React.Fragment>
        }
      </dd>
    </div>
  </div>
}

function AssigneeBlock ({ conversation, app }) {
  return <div className="">
    <div className="space-y-2 pt-2">
      <dt className="text-sm leading-5 font-medium text-gray-500">
        {I18n.t('conversation.sidebar.assignee')}
      </dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900">
        <Link to={`/apps/${app.key}/agents/${conversation.assignee.id}`}
          className="relative group flex items-center space-x-2.5">
          <img className="rounded-full flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-gray-500"
            src={conversation.assignee.avatarUrl}>
          </img>
          <div className="text-sm leading-5 text-gray-500 group-hover:text-gray-900 font-medium truncate">
            {conversation.assignee && conversation.assignee.email}
          </div>
        </Link>
      </dd>
    </div>
  </div>
}

function getPackage (data, cb) {
  graphql(APP_PACKAGE_HOOK,
    {
      ...data,
      location: 'inbox'
    },
    {
      success: (data) => {
        cb && cb(data)
      },
      error: () => {}
    })
}

function AppItem ({
  app,
  object,
  conversation,
  app_user
}) {
  const pkg = object
  const [definitions, setDefinitions] = React.useState(object.definitions)

  function updatePackage (packageParams, cb) {
    /* if (packageParams.field.action.type === 'frame') {
      return displayAppBlockFrame({
        message: {},
        data: {
          field: packageParams.field,
          location: packageParams.location,
          id: pkg.name,
          appKey: app.key,
          values: { ...pkg.values, ...packageParams.values }
        }
      })
    } */

    if (packageParams.field.action.type === 'url') {
      return window.open(packageParams.field.action.url)
    }

    const params = {
      id: pkg.name,
      appKey: app.key,
      hooKind: packageParams.field.action.type,
      ctx: {
        conversation_key: conversation.key,
        field: packageParams.field,
        location: 'inbox',
        values: packageParams.values
      }
    }
    getPackage(params, (data) => {
      const defs = data.app.appPackage.callHook.definitions
      setDefinitions(defs)
      cb && cb()
    })
  }

  return (
    <ErrorBoundary>
      <div
        className="rounded-md border border-gray-200 bg-white w-full p-2--">
        <p className="hidden text-sm leading-5 font-medium text-gray-900">
          {object.name}
        </p>

        {
          object.type === 'internal' && renderInternal({ object, conversation, app, app_user })
        }

        { object.type !== 'internal' &&
          <DefinitionRenderer
            schema={definitions}
            size="sm"
            appPackage={object}
            // disabled={true}
            updatePackage={updatePackage}
          />
        }
      </div>
    </ErrorBoundary>
  )
}

function mapStateToProps (state) {
  const { auth, app, conversation, app_user, current_user, drawer } = state
  const { messages, loading } = conversation
  const { jwt } = auth

  return {
    app_user,
    conversation,
    current_user,
    messages,
    app,
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(Sidebar))
