import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import { APP_USER } from "../graphql/queries"
import {SYNC_EXTERNAL_PROFILE} from "../graphql/mutations"

export function getAppUser(userId, cb){
  return (dispatch, getState) => {
    dispatch(dispatchSetAppUser(null))
    graphql(APP_USER, {
        appKey: getState().app.key, 
        id: userId
      }, 
      {
        success: (data)=>{
          dispatch(dispatchSetAppUser(data.app.appUser))
          cb ? cb(data) : null
          /*this.setState({
            selectedUser: data.app.appUser
          })*/
      },
      error: ()=>{
      }
    })
  }
}


export function syncExternalProfile(id, profile, cb){
  return (dispatch, getState) => {
    graphql(SYNC_EXTERNAL_PROFILE, {
      appKey: getState().app.key,
      id: id,
      provider: profile.provider
    }, 
    {
      success: (data)=>{
        dispatch(dispatchSetAppUser(data.syncExternalProfile.appUser))
        cb && cb(data)
      }
    , error: ()=>{}
    })
  }
}


function dispatchClearAppUser(data) {
  return {
    type: ActionTypes.clearAppUser
  }
}

function dispatchSetAppUser(data) {
  return {
    type: ActionTypes.setAppUser,
    data: data
  }
}

const initialState = {}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
    case ActionTypes.setAppUser: {
      return action.data
    }
    case ActionTypes.clearAppUser: {
      return initialState
    }
    default:
      return state;
  }
}