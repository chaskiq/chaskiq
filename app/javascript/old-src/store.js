import { compose, createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk'
import persistState from 'redux-localstorage'

import auth from './actions/auth'
import app from './actions/app'
import segment from './actions/segments'
import app_users from './actions/app_users'
import app_user from './actions/app_user'

import conversations from './actions/conversations'
import conversation from './actions/conversation'
import current_user from './actions/current_user'
import status_message from './actions/status_messages'
import navigation from './actions/navigation'
import drawer from './actions/drawer'
import theme from './actions/theme'
import imageZoom from './actions/imageZoom'

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
  imageZoom
})

const middlewares = [thunkMiddleware]//, routerMiddleware(history)]

const enhancer = compose(
  applyMiddleware(...middlewares),
  persistState('auth', { key: 'AUTH'}),
  persistState("theme", { key: 'THEME' })
)

const store = createStore(rootReducer, composeWithDevTools(
  enhancer
));

export default store
