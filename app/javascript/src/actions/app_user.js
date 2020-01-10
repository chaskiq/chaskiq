import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import { APP_USER} from "../graphql/queries"

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