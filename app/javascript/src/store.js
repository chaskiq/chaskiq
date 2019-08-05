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
import current_page from './actions/navigation'
import drawer from './actions/drawer'

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
  current_page,
  drawer
})

const middlewares = [thunkMiddleware]//, routerMiddleware(history)]

const enhancer = compose(
  applyMiddleware(...middlewares),
  persistState('auth', { key: 'AUTH' })
)

const store = createStore(rootReducer, composeWithDevTools(
  enhancer
));

export default store
