import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import { SEGMENT, APP_USER} from "../graphql/queries"
import { 
  PREDICATES_SEARCH, 
  PREDICATES_CREATE, 
  PREDICATES_UPDATE, 
  PREDICATES_DELETE 
} from '../graphql/mutations'

import {dispatchSegmentUpdate} from './segments'

/*
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
      },
      error: (error) => {
        debugger
      }
    }) 

  }
}*/

export function searchAppUsers(options, cb){
  return (dispatch, getState) => {
    
    dispatch(dispatchLoading())

    let { page } = options
    const appKey = getState().app.key

    const segment = getState().segment
    const jwtData = segment.jwt ? parseJwt(segment.jwt).data : segment.predicates
    const predicates_data = { data: {
                                predicates: jwtData.filter( (o)=> o.comparison )
                              }
                            }                   
    
    options = {
      appKey: appKey,
      search: predicates_data,
      jwt: jwtData,
      page: page
    }

    console.log("OPTs", options)
    
    graphql(PREDICATES_SEARCH, 
      options, 
      {
      success: (data)=>{
        const appUsers = data.predicatesSearch.appUsers
        let newData = Object.assign(appUsers, {searching: false}) //, segment)
        
        const newSegment = Object.assign({}, segment, { predicates: jwtData })

        dispatch(dispatchSegmentUpdate(newSegment))

        newData = Object.assign(newData) //, segment)
        
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
      return Object.assign({}, state, action.data)
    }
    case ActionTypes.initSearchAppUsers: {
      return Object.assign({}, state, action.data)
    }
    default:
      return state;
  }
}