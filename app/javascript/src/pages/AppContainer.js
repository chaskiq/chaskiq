import React from 'react'

import Sidebar from '../components/sidebar'
import { Switch, Route, withRouter } from 'react-router-dom'
import { isEmpty } from 'lodash'
import { camelizeKeys } from '../actions/conversation'

import Dashboard from './Dashboard'
import Platform from './Platform'
import Conversations from './Conversations'
import Settings from './Settings'
import MessengerSettings from './MessengerSettings'
import Team from './Team'
import Webhooks from './Webhooks'
import Integrations from './Integrations'
import Articles from './Articles'
import Bots from './Bots'
import Campaigns from './Campaigns'
import CampaignHome from './campaigns/home'
import Progress from '../components/Progress'
import UserSlide from '../components/UserSlide'
import Profile from './Profile'
import AgentProfile from './AgentProfile'
import Billing from './Billing'
import Api from './Api'
import Workflows from './workflows'

import { connect } from 'react-redux'

import UpgradePage from './UpgradePage'
// import Pricing from '../pages/pricingPage'

import { getCurrentUser } from '../actions/current_user'

import actioncable from 'actioncable'
import { setApp } from '../actions/app'
import { setSubscriptionState } from '../actions/paddleSubscription'

import { updateAppUserPresence } from '../actions/app_users'
import { getAppUser } from '../actions/app_user'
import { updateRtcEvents } from '../actions/rtc'
import { updateCampaignEvents } from '../actions/campaigns'

import {
  appendConversation
} from '../actions/conversations'

import { toggleDrawer } from '../actions/drawer'

import UserProfileCard from '../components/UserProfileCard'
import LoadingView from '../components/loadingView'
import ErrorBoundary from '../components/ErrorBoundary'

function AppContainer ({
  match,
  dispatch,
  isAuthenticated,
  current_user,
  app,
  drawer,
  app_user,
  loading,
  upgradePages,
  accessToken
}) {
  const CableApp = React.useRef({
    events: null,
    cable: actioncable.createConsumer(
      `${window.chaskiq_cable_url}?app=${match.params.appId}&token=${accessToken}`)
  })

  const [subscribed, setSubscribed] = React.useState(null)

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
    if (CableApp.current.events) {
      CableApp.current.events.unsubscribe()
    }

    CableApp.current.events = CableApp.current.cable.subscriptions.create(
      {
        channel: 'EventsChannel',
        app: id
      },
      {
        connected: () => {
          console.log('connected to events')
          setSubscribed(true)
        },
        disconnected: () => {
          console.log('disconnected from events')
          setSubscribed(false)
        },
        received: (data) => {
          // console.log('received', data)
          switch (data.type) {
            case 'conversation_part':
              return dispatch(appendConversation(camelizeKeys(data.data)))
            case 'presence':
              return updateUser(camelizeKeys(data.data))
            case 'rtc_events':
              return dispatch(updateRtcEvents(data))
            case 'campaigns':
              return dispatch(updateCampaignEvents(data.data))
            case 'paddle:subscription':
              fetchApp(() => {
                dispatch(setSubscriptionState(data.data))
              })
              return null
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

    // window.cable = CableApp
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

      { drawer.userDrawer &&
        <UserSlide
          open={!!drawer.userDrawer}
          onClose={handleUserSidebar}>

          {app_user ? (
            <UserProfileCard
              width={'300px'}
            />
          ) : (
            <Progress />
          )}

        </UserSlide>
      }

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

          { !isEmpty(upgradePages) &&
            <UpgradePage page={upgradePages}/>
          }

          { app && isEmpty(upgradePages) && 
            <ErrorBoundary variant={'very-wrong'}>
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

                <Route path={`${match.url}/messenger`}>
                  <MessengerSettings />
                </Route>

                <Route path={`${match.url}/team`}>
                  <Team />
                </Route>

                <Route exact path={`${match.path}/users/:id`}
                  render={(props) => (
                    <Profile
                      {...props}
                    />
                  )}
                />

                <Route exact path={`${match.path}/agents/:id`}
                  render={(props) => (
                    <AgentProfile
                      {...props}
                    />
                  )}
                />

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
                  <Conversations
                    subscribed
                    events={CableApp.current.events}
                  />
                </Route>

                <Route path={`${match.url}/oauth_applications`}>
                  <Api />
                </Route>

                <Route path={`${match.url}/billing`}>
                  <Billing />
                </Route>

                <Route path={`${match.url}/bots`}>
                  <Bots />
                </Route>

                <Route path={`${match.url}/workflows`}>
                  <Workflows />
                </Route>

                <Route path={`${match.path}/campaigns`}>
                  <CampaignHome />
                </Route>

                <Route path={`${match.path}/messages/:message_type`}>
                  <Campaigns />
                </Route>
              </Switch>
            </ErrorBoundary>
          }

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
    navigation,
    paddleSubscription,
    upgradePages
  } = state
  const { loading, isAuthenticated, accessToken } = auth
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
    drawer,
    paddleSubscription,
    upgradePages,
    accessToken
  }
}

export default withRouter(connect(mapStateToProps)(AppContainer))
