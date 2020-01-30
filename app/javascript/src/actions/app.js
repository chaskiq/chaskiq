import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import {APP} from '../graphql/queries'
import {UPDATE_APP} from '../graphql/mutations'

import {errorMessage, successMessage} from './status_messages'
import {isEmpty} from 'lodash'

export function setApp(key, cb){
  return (dispatch, getState) => {
    graphql(APP, {appKey: key}, {
      success: (data)=>{
        dispatch(getApp( data.app ))
        if (cb && cb.success)
          cb.success(data.app)
      },
      error: (err)=>{
        if (cb && cb.error)
          cb.success(err)
      }
    })
  }
}

export function clearApp(){
  return (dispatch, getState) => {
    dispatch(getApp( null ))
  }
}

function getApp(app) {
  return {
    type: ActionTypes.GetApp,
    data: app
  }
}


export function updateApp(appParams, cb){
  return (dispatch, getState)=>{
    graphql(UPDATE_APP, {
      appKey: getState().app.key,
      appParams: appParams
    }, {
      success: (data)=>{
        const newObject = Object.assign({}, data.appsUpdate.app, {errors: data.appsUpdate.errors})
        dispatch(getApp(newObject))
        if(isEmpty(data.appsUpdate.errors)){
          dispatch(successMessage("app settings updated"))
        }
      },
      error: (error)=>{
        console.log("ERRR Updating app", error)
      }
    })

  }



}


const initialState = null

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
    case ActionTypes.GetApp: {
      return action.data
    }
    default:
      return state;
  }
}
