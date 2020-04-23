import React from 'react'

import Sidebar from '../components/sidebar'
import { Switch, Route, withRouter } from 'react-router-dom'

import { camelizeKeys } from '../actions/conversation'

import Dashboard from './Dashboard'
import Platform from './Platform'
import Conversations from './Conversations'
import Settings from './Settings'
import Team from './Team'
import Webhooks from './Webhooks'
import Integrations from './Integrations'
import Articles from './Articles'
import Bots from './Bots'
import Campaigns from './Campaigns'
import CampaignHome from './campaigns/home'
import Progress from '../components/Progress'

import { connect } from 'react-redux'

// import Pricing from '../pages/pricingPage'

import { getCurrentUser } from '../actions/current_user'

import actioncable from 'actioncable'
import { setApp } from '../actions/app'

import { updateAppUserPresence } from '../actions/app_users'
import { getAppUser } from '../actions/app_user'
import { updateRtcEvents} from '../actions/rtc'

import {

  appendConversation
} from '../actions/conversations'

import { toggleDrawer } from '../actions/drawer'

import UserData from '../components/UserData'
import LoadingView from '../components/loadingView'

const CableApp = {
  cable: actioncable.createConsumer(window.ws_cable_url)
}

function App ({
  match,
  dispatch,
  isAuthenticated,
  current_user,
  app,
  drawer,
  app_user,
  loading
}) {
  React.useEffect(() => {
    dispatch(getCurrentUser())

    fetchApp(() => {
      eventsSubscriber(match.params.appId)
    })
  }, [match.params.appId])

  const fetchApp = (cb) => {
    const id = match.params.appId
    dispatch(
      setApp(id, {
        success: () => {
          cb && cb()
        }
      })
    )
  }

  const eventsSubscriber = (id) => {
    // unsubscribe cable ust in case
    if (CableApp.events) {
      CableApp.events.unsubscribe()
    }

    CableApp.events = CableApp.cable.subscriptions.create(
      {
        channel: 'EventsChannel',
        app: id
      },
      {
        connected: () => {
          console.log('connected to events')
        },
        disconnected: () => {
          console.log('disconnected from events')
        },
        received: (data) => {
          console.log('received', data)
          switch (data.type) {
            case 'conversation_part':
              return dispatch(appendConversation(camelizeKeys(data.data)))
            case 'presence':
              return updateUser(camelizeKeys(data.data))
            case 'rtc_events':
              return dispatch(updateRtcEvents(data))
            default:
              return null
          }
        },
        notify: () => {
          console.log('notify!!')
        },
        handleMessage: (message) => {
          console.log('handle message')
        }
      }
    )

    window.cable = CableApp
  }

  function updateUser (data) {
    dispatch(updateAppUserPresence(data))
  }

  function setAppUser (id) {
    dispatch(getAppUser(id))
  }

  function handleSidebar () {
    dispatch(toggleDrawer({ open: !drawer.open }))
  }

  function handleUserSidebar () {
    dispatch(toggleDrawer({ userDrawer: !drawer.userDrawer }))
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {app && <Sidebar />}

      {drawer.open && (
        <div
          onClick={handleSidebar}
          style={{
            background: '#000',
            position: 'fixed',
            opacity: 0.7,
            zIndex: 1,
            width: '100vw',
            height: '100vh'
          }}
        ></div>
      )}

      {drawer.userDrawer && (
        <div
          className="navbar w-64 absolute
              bg-white top-0 z-50 right-0  navbar-open"
        >
          <div className="overflow-x-scroll h-screen">
            {app_user ? (
              <UserData width={'300px'} app={app} appUser={app_user} />
            ) : (
              <Progress />
            )}
          </div>
        </div>
      )}

      {drawer.userDrawer && (
        <div
          onClick={handleUserSidebar}
          style={{
            background: '#000',
            position: 'fixed',
            opacity: 0.6,
            zIndex: 10,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
          }}
        />
      )}

      {loading || !app && <LoadingView />}

      {isAuthenticated && current_user.email && (
        <div className="flex flex-col w-0 flex-1 overflow-auto">
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
            <button
              onClick={handleSidebar}
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-150"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {app && (
            <Switch>
              <Route path={`${match.url}/`} exact>
                <Dashboard />
              </Route>

              <Route exact path={`${match.path}/segments/:segmentID/:Jwt?`}>
                <Platform />
              </Route>

              <Route path={`${match.url}/settings`}>
                <Settings />
              </Route>

              <Route path={`${match.url}/team`}>
                <Team />
              </Route>

              <Route path={`${match.url}/webhooks`}>
                <Webhooks />
              </Route>

              <Route path={`${match.url}/integrations`}>
                <Integrations />
              </Route>

              <Route path={`${match.url}/articles`}>
                <Articles />
              </Route>

              <Route path={`${match.url}/conversations`}>
                <Conversations events={CableApp.events} />
              </Route>

              <Route path={`${match.url}/bots`}>
                <Bots />
              </Route>

              <Route path={`${match.url}/campaigns`}>
                <CampaignHome />
              </Route>

              <Route path={`${match.path}/messages/:message_type`}>
                <Campaigns />
              </Route>
            </Switch>
          )}
        </div>
      )}
    </div>
  )
}

function mapStateToProps (state) {
  const {
    auth,
    drawer,
    app,
    segment,
    app_user,
    app_users,
    current_user,
    navigation
  } = state
  const { loading, isAuthenticated } = auth
  const { current_section } = navigation
  return {
    segment,
    app_users,
    app_user,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section,
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(App))
