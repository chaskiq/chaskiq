import axios from 'axios'
import ActionTypes from '../constants/action_types'

// Action Creators
export function setCurrentPage(url) {
  return (dispatch, getState) => {    
     dispatch({
       type: ActionTypes.SetCurrentPage,
       data: url
     })
  }
}


const navigationState = null

// Reducer
export default function reducer(state = navigationState, action = {}) {
  switch (action.type) {
    case ActionTypes.SetCurrentPage:
      return action.data
    default: return state
  }
}
