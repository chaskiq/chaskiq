import { compose, createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'
import persistState from 'redux-localstorage'

import auth, {signout, successAuthentication, authenticate, doSignout} from './actions/auth'
import app, {clearApp, setApp} from './actions/app'

import segment, {
  dispatchSegmentUpdate,
  fetchAppSegment,
  updateSegment,
  createSegment,
  deleteSegment,
  addPredicate,
  updatePredicate,
  deletePredicate
} from './actions/segments'
import app_users, {updateAppUserPresence, searchAppUsers} from './actions/app_users'
import app_user from './actions/app_user'
import rtc, {updateRtcEvents} from './actions/rtc'
import campaigns, {updateCampaignEvents} from './actions/campaigns'
import upgradePages from './actions/upgradePages'
import conversations from './actions/conversations'

import { toggleDrawer } from './actions/drawer'
import { getAppUser } from './actions/app_user'

import conversation, {
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
  updateConversationTagList,
  camelizeKeys
} from './actions/conversation'

import {
  clearLocks
} from './actions/upgradePages'


import {
  appendConversation,
  getConversations,
  updateConversationsData,
  clearConversations
} from './actions/conversations'

import current_user, {getCurrentUser} from './actions/current_user'
import status_message, {successMessage,errorMessage} from './actions/status_messages'
import navigation, {
  setCurrentPage, 
  setCurrentSection
} from './actions/navigation'
import drawer from './actions/drawer'
import theme, {toggleTheme} from './actions/theme'
import imageZoom, {setImageZoom} from './actions/imageZoom'

import paddleSubscription, {setSubscriptionState, clearSubscriptionState} from './actions/paddleSubscription'

import client from './graphql/client'
import docsQueries from './graphql/docsQueries'
import fragments from './graphql/fragments'
import mutations from './graphql/mutations'
import queries from './graphql/queries'

const rootReducer = combineReducers({
  auth,
  app,
  segment,
  app_users,
  app_user,
  conversation,
  conversations,
  current_user,
  status_message,
  navigation,
  drawer,
  theme,
  imageZoom,
  rtc,
  campaigns,
  paddleSubscription,
  upgradePages
})

const middlewares = [thunkMiddleware] //, routerMiddleware(history)]

const enhancer = compose(
  applyMiddleware(...middlewares),
  persistState('auth', { key: 'AUTH' }),
  persistState('current_user', { key: 'CURRENT_USER' }),
  persistState('theme', { key: 'THEME' })
)

const store = createStore(rootReducer, composeWithDevTools(enhancer))

export default store

const actions = {
  successAuthentication,
  camelizeKeys,
  appendConversation,
  updateRtcEvents,
  getAppUser,
  toggleDrawer,
  dispatchSegmentUpdate,
  auth, signout, authenticate, doSignout,
  app, setApp,
  clearApp,
  segment,
  clearLocks,

    setCurrentPage, 
    setCurrentSection,
    fetchAppSegment,
    updateSegment,
    createSegment,
    deleteSegment,
    addPredicate,
    updatePredicate,
    deletePredicate,

  app_users, updateAppUserPresence, searchAppUsers,
  app_user,
  conversation,

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
    updateConversationTagList,

  conversations,   getConversations, updateConversationsData, clearConversations,
  current_user, getCurrentUser,
  status_message, successMessage,errorMessage,
  navigation,
  drawer,
  theme, toggleTheme,
  imageZoom, setImageZoom,
  rtc,
  campaigns, updateCampaignEvents,
  paddleSubscription, setSubscriptionState, clearSubscriptionState,
  upgradePages
}

export {
  client, 
  docsQueries, 
  fragments, 
  mutations, 
  queries,
  actions
}


