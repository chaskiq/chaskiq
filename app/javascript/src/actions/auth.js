import axios from 'axios'

// Actions
const REQUEST = 'auth/REQUEST'
const RECEIVED = 'auth/RECEIVED'
const FAILED = 'auth/FAILED'
const SIGNOUT = 'auth/SIGNOUT'

import {errorMessage} from './status_messages'

import {clearCurrentUser} from './current_user'

// Action Creators
export function authenticate(email, password, cb) {
  return (dispatch, getState) => {
    dispatch(startAuthentication())
    return axios({
      //url: '/agents/sign_in.json',
      url: '/oauth/token.json',
      method: 'POST',
      /*auth: {
        username: "oez_okGx2AihZp0iRtEzp_ACAfik-JzWbIi8aQuGX6U",
        password: "rpruGxmsm9v0NHyxdIX2czYBGLa8ZzcQi8qWCXERTNo"
      },*/
      data: { 
        agent: { email,  password},
        email: email, 
        password: password,
        grant_type: "password" ,
        client_id: "oez_okGx2AihZp0iRtEzp_ACAfik-JzWbIi8aQuGX6U",
        client_secret: "rpruGxmsm9v0NHyxdIX2czYBGLa8ZzcQi8qWCXERTNo"
      }
    }).then(response => {
      /*const uid = response.headers['uid']
      const client = response.headers['client']
      const accessToken = response.headers['access-token']
      const expiry = response.headers['expiry']*/
      //const jwt = response.headers['authorization']
      const accessToken = response.data.access_token
      const refreshToken = response.data.refresh_token
      dispatch(successAuthentication(accessToken, refreshToken )) //, uid, client, accessToken, expiry))

      cb ? cb() : null
    }).catch(data => {
      const err = data.response.data ? data.response.data.error : 'error!'
      dispatch(errorMessage(err))
      dispatch(failAuthentication())
    })
  }
}

export function signout() {

  return (dispatch, getState) => {
   
    const { auth } = getState()

    axios.delete(
      '/agents/sign_out.json',
      {
        headers: {
          'access-token': auth.accessToken,
          'client': auth.client,
          'uid': auth.uid,
        }
      }
    ).then(response => {
      dispatch(doSignout())
      dispatch(clearCurrentUser())
    }).catch(error => {
      console.log(error)
    })

  }
}

export function expireAuthentication() {
  return doSignout()
}

function startAuthentication() {
  return { type: REQUEST }
}

export function successAuthentication(accessToken, refreshToken){
  //, uid, client, accessToken, expiry) {
  return { type: RECEIVED, 
    data: {
      refresh_token: refreshToken, 
      access_token: accessToken 
    }
  } // uid, client, accessToken, expiry }
}

function failAuthentication() {
  return { type: FAILED }
}

export function doSignout() {
  return { type: SIGNOUT }
}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST:
      return Object.assign(
        {},
        state,
        {
          loading: true
        }
      )
    case RECEIVED:
      return Object.assign(
        {},
        state,
        {
          loading: false,
          isAuthenticated: true,
          //uid: action.uid,
          //client: action.client,
          accessToken: action.data.access_token,
          refreshToken: action.data.refresh_token,
          //jwt: action.jwt,
          //expiry: action.expiry
        }
      )
    case FAILED:
      return Object.assign(
        {},
        state,
        {
          loading: false
        }
      )
    case SIGNOUT:
      return Object.assign(
        {},
        initialState
      )
    default: return state
  }
}

const initialState = {
  loading: false,
  isAuthenticated: false,
  client: null,
  accessToken: null,
  uid: null,
  expiry: null
}