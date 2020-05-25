import axios from 'axios'
import { errorMessage } from './status_messages'
import { clearCurrentUser } from './current_user'

// Actions
const REQUEST = 'auth/REQUEST'
const RECEIVED = 'auth/RECEIVED'
const FAILED = 'auth/FAILED'
const SIGNOUT = 'auth/SIGNOUT'
const REFRESHING = 'auth/REFRESHING'

// Action Creators
export function authenticate (email, password, cb) {
  return (dispatch, getState) => {

    if(getState().auth.loading) return 

    dispatch(startAuthentication())

    axios.defaults.withCredentials = true

    return axios({
      // baseURL: 'http://localhost:3000',
      // url: '/agents/sign_in.json',
      url: '/oauth/token.json',
      method: 'POST',
      data: {
        agent: { email, password },
        email: email,
        password: password,
        grant_type: 'password'
      }
    })
      .then((response) => {
        const accessToken = response.data.access_token
        const refreshToken = response.data.refresh_token
        dispatch(successAuthentication(accessToken, refreshToken)) //, uid, client, accessToken, expiry))

        if (cb) cb()
      })
      .catch((data) => {
        const err =
          data && data.response.data ? data.response.data.message : 'error!'
        dispatch(errorMessage(err))
        dispatch(failAuthentication())
      })
  }
}

export function signout () {
  return (dispatch, getState) => {
    const { auth } = getState()

    axios
      .delete('/agents/sign_out.json', {
        headers: {
          'access-token': auth.accessToken,
          client: auth.client,
          uid: auth.uid
        }
      })
      .then((response) => {
        dispatch(doSignout())
        dispatch(clearCurrentUser())
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

export function expireAuthentication () {
  return doSignout()
}

function startAuthentication () {
  return { type: 'auth/REQUEST' }
}

export function successAuthentication (accessToken, refreshToken) {
  //, uid, client, accessToken, expiry) {
  return {
    type: RECEIVED,
    data: {
      refresh_token: refreshToken,
      access_token: accessToken
    }
  } // uid, client, accessToken, expiry }
}

export function refreshToken (auth) {
  return (dispatch, getState) => {
    dispatch(startAuthentication())
    dispatch(errorMessage('refresh token, hang tight'))

    axios.create({
      baseURL: '/oauth/token'
    }).post('', {
      refresh_token: auth.refreshToken,
      grant_type: 'refresh_token'
    }).then(res => {
      const accessToken = res.data.access_token
      const refreshToken = res.data.refresh_token
      dispatch(successAuthentication(accessToken, refreshToken))
      window.location = "/"
    }).catch(c => {
      dispatch(expireAuthentication())
    })
  }
}

function failAuthentication () {
  return { type: FAILED }
}

export function doSignout () {
  return { type: SIGNOUT }
}

export function doRefresh () {
  return { type: REFRESHING }
}

// Reducer
export default function reducer (state, action = {}) {
  const REQUEST = 'auth/REQUEST'
  const RECEIVED = 'auth/RECEIVED'
  const FAILED = 'auth/FAILED'
  const SIGNOUT = 'auth/SIGNOUT'

  const initialState = {
    loading: false,
    isAuthenticated: false,
    client: null,
    accessToken: null,
    uid: null,
    expiry: null,
    status: null
  }

  switch (action.type) {
    case REQUEST:
      return Object.assign({}, state, {
        loading: true
      })
    case RECEIVED:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        // uid: action.uid,
        // client: action.client,
        accessToken: action.data.access_token,
        refreshToken: action.data.refresh_token
        // jwt: action.jwt,
        // expiry: action.expiry
      })
    case FAILED:
      return Object.assign({}, state, {
        loading: false
      })
    case SIGNOUT:
      return Object.assign({}, initialState)
    default:
      return state === undefined ? initialState : state
  }
}
