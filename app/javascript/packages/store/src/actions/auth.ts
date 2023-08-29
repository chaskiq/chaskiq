import axios from 'axios';
import { errorMessage } from './status_messages';
import { clearCurrentUser } from './current_user';
import { ActionType } from '../constants/action_types';

// Actions
const REQUEST = 'auth/REQUEST';
const RECEIVED = 'auth/RECEIVED';
const FAILED = 'auth/FAILED';
const SIGNOUT = 'auth/SIGNOUT';
const REFRESHING = 'auth/REFRESHING';

// Action Creators
export function authenticate(email, password, cb) {
  return (dispatch, getState) => {
    if (getState().auth.loading) return;

    dispatch(startAuthentication());

    axios.defaults.withCredentials = true;

    //@ts-ignore
    const client_id = document.querySelector(
      'meta[name="chaskiq-client-id"]'
    )?.content;

    return axios({
      // baseURL: 'http://localhost:3000',
      // url: '/agents/sign_in.json',
      url: '/oauth/token.json',
      method: 'POST',
      data: {
        client_id: client_id,
        agent: { email, password },
        email: email,
        username: email,
        password: password,
        grant_type: 'password',
      },
    })
      .then((response) => {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        dispatch(successAuthentication(accessToken, refreshToken)); //, uid, client, accessToken, expiry))

        if (cb) cb();
      })
      .catch((data) => {
        const err =
          data && data.response.data ? data.response.data.message : 'error!';
        dispatch(errorMessage(err));
        dispatch(failAuthentication());
      });
  };
}

// Auth0 Action Creators
export function authenticateFromAuth0(accessToken, refreshToken, cb) {
  return (dispatch, getState) => {
    //if (getState().auth.loading) return;

    axios.defaults.withCredentials = true;

    //@ts-ignore
    const crsfToken = document.querySelector(
      'meta[name="csrf-token"]'
    )?.content;

    return axios({
      url: '/auth0/authenticate.json',
      method: 'POST',
      data: {
        authenticity_token: crsfToken,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    })
      .then((response) => {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        dispatch(successAuthentication(accessToken, refreshToken)); //, uid, client, accessToken, expiry))
        if (cb) cb();
      })
      .catch((data) => {
        const err =
          data && data.response.data ? data.response.data.message : 'error!';
        dispatch(errorMessage(err));
        dispatch(failAuthentication());
      });
  };
}

export function signout() {
  return (dispatch, getState) => {
    const { auth } = getState();

    axios
      .delete('/agents/sign_out.json', {
        headers: {
          'access-token': auth.accessToken,
          client: auth.client,
          uid: auth.uid,
        },
      })
      .then(() => {
        dispatch(doSignout());
        dispatch(clearCurrentUser());
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

export function successAuthentication(accessToken, refreshToken) {
  //, uid, client, accessToken, expiry) {
  return {
    type: RECEIVED,
    data: {
      refresh_token: refreshToken,
      access_token: accessToken,
    },
  }; // uid, client, accessToken, expiry }
}

export function refreshToken(auth) {
  //@ts-ignore
  const client_id = document.querySelector(
    'meta[name="chaskiq-client-id"]'
  )?.content;

  return (dispatch, _getState) => {
    dispatch(startAuthentication());
    dispatch(errorMessage('refresh token, hang tight'));

    axios
      .create()
      .post('/oauth/token', {
        refresh_token: auth.refreshToken,
        grant_type: 'refresh_token',
        client_id: client_id,
      })
      .then((res) => {
        const accessToken = res.data.access_token;
        const refreshToken = res.data.refresh_token;
        dispatch(successAuthentication(accessToken, refreshToken));
        window.location.href = '/';
      })
      .catch(() => {
        dispatch(expireAuthentication());
      });
  };
}

export function expireAuthentication() {
  return doSignout();
}

export function startAuthentication() {
  return { type: REQUEST };
}

function failAuthentication() {
  return { type: FAILED };
}

export function doSignout() {
  return { type: SIGNOUT };
}

export function doRefresh() {
  return { type: REFRESHING };
}

// Reducer
export default function reducer(state, action: ActionType = {}) {
  const REQUEST = 'auth/REQUEST';
  const RECEIVED = 'auth/RECEIVED';
  const FAILED = 'auth/FAILED';
  const SIGNOUT = 'auth/SIGNOUT';

  const initialState = {
    loading: false,
    isAuthenticated: false,
    client: null,
    accessToken: null,
    uid: null,
    expiry: null,
    status: null,
  };

  switch (action.type) {
    case REQUEST:
      return Object.assign({}, state, {
        loading: true,
      });
    case RECEIVED:
      return Object.assign({}, state, {
        loading: false,
        isAuthenticated: true,
        // uid: action.uid,
        // client: action.client,
        accessToken: action.data.access_token,
        refreshToken: action.data.refresh_token,
        // jwt: action.jwt,
        // expiry: action.expiry
      });
    case FAILED:
      return Object.assign({}, state, {
        loading: false,
      });
    case SIGNOUT:
      return Object.assign({}, initialState);
    default:
      return state === undefined ? initialState : state;
  }
}
