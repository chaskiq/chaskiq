import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import {APP} from '../graphql/queries'

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

function getApp(app) {
  return {
    type: ActionTypes.GetApp,
    data: app
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
