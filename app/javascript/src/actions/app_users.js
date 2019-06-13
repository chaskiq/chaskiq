import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import { SEGMENT, APP_USER} from "../graphql/queries"
import { 
  PREDICATES_SEARCH, 
  PREDICATES_CREATE, 
  PREDICATES_UPDATE, 
  PREDICATES_DELETE 
} from '../graphql/mutations'

export function searchAppUsers(options, cb){
  return (dispatch, getState) => {
    
    dispatch(dispatchLoading())
    
    graphql(PREDICATES_SEARCH, 
      options, 
      {
      success: (data)=>{
        const appUsers = data.predicatesSearch.appUsers
        //console.log(jwtData)
        const newData = Object.assign(appUsers, {searching: false})
        dispatch(dispatchSearchAppUsers(newData))

        cb ? cb() : null

        /*this.setState({
          segment: Object.assign({}, this.state.segment, { predicates: jwtData }),
          app_users: appUsers.collection,
          meta: appUsers.meta,
          searching: false
        })*/
      },
      error: (error) => {
        debugger
      }
    }) 

  }
}

function dispatchLoading(){
  return {
    type: ActionTypes.initSearchAppUsers,
    data: {
      searching: true
    }
  }  
}

function dispatchSearchAppUsers(data) {
  return {
    type: ActionTypes.searchAppUsers,
    data: data
  }
}

const initialState = {
  collection: [], 
  meta: {},
  searching: true
}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
    case ActionTypes.searchAppUsers: {
      return action.data
    }
    case ActionTypes.initSearchAppUsers: {
      return Object.assign(state, action.data)
    }
    default:
      return state;
  }
}