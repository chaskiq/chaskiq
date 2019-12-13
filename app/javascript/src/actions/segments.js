import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'
import { SEGMENT, APP_USER} from "../graphql/queries"
import { 
  PREDICATES_SEARCH, 
  PREDICATES_CREATE, 
  PREDICATES_UPDATE, 
  PREDICATES_DELETE 
} from '../graphql/mutations'

import {parseJwt, generateJWT} from '../components/segmentManager/jwt'

export function fetchAppSegment(id, cb){

  return (dispatch, getState)=>{

    graphql(SEGMENT, {
      appKey: getState().app.key,
      id: parseInt(id)
    }, {
      success: (data)=>{

        dispatch(
          dispatchSegmentUpdate(Object.assign(
            {}, 
            data.app.segment, 
            {initialPredicates: data.app.segment.predicates} 
           )
          )
        )

        cb ? cb() : null

        //this.search
      },
      error: (error)=>{
        console.log(error);
      }
    })

  }
}

export function updateSegment(id, cb){

  return (dispatch, getState)=>{

    const params = {
      appKey: getState().app.key,
      id: getState().segment.id,
      predicates: getState().segment.predicates
    }

    graphql(PREDICATES_UPDATE, params, {
      
      success: (data)=>{
        dispatchSegmentUpdate(
          Object.assign(data.predicatesUpdate.segment, {jwt: null})
        )

        cb ? cb() : null

        /*this.setState({
          segment: data.predicatesUpdate.segment,
          jwt: null
        }, () => cb ? cb() : null)*/
      },

      error: (error)=>{
      }

    })

  }
}

export function createSegment(options, cb){

  return (dispatch, getState)=>{

    const params = {
      appKey: getState().app.key,
      name: options.name,
      predicates: getState().segment.predicates
    }

    graphql(PREDICATES_CREATE, params, {
      success: (data)=>{
        dispatch(
          dispatchSegmentUpdate(
            Object.assign(data.predicatesCreate.segment, {jwt: null})
          )
        )

        cb ? cb() : null
      },
      error: (error)=>{

      }
    })

  }

}

export function deleteSegment(id, cb){

  return (dispatch, getState)=>{
    graphql(PREDICATES_DELETE, {
      appKey: getState().app.key,
      id: id
    }, {
      success: (data)=>{
        cb ? cb() : null
      },
      error: (error)=>{
      }
    })
  }
}

export function addPredicate(options, cb){
  return (dispatch, getState)=>{

    const new_predicates = getState().segment
                                     .predicates
                                     .concat(options)

    const jwtToken = generateJWT(new_predicates)                                
    dispatch(
      dispatchSegmentUpdate(
        {
          jwt: jwtToken
        }
      )
    )

    if(cb)
      cb(jwtToken)
  }
}

export function updatePredicate(data, cb){
  return (dispatch, getState)=>{
    const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    dispatch(
      dispatchSegmentUpdate(
        {
          jwt: jwtToken
        }
      )
    )

    if(cb)
      cb(jwtToken)
  }
}


export function deletePredicate(data, cb){
  return (dispatch, getState)=>{
    const jwtToken = generateJWT(data)  

    dispatch(
      dispatchSegmentUpdate(
        { 
          id: getState().segment.id,
          predicates: data,
          jwt: jwtToken
        }
      )
    )

    if(cb)
      cb()
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

export function dispatchSegmentUpdate(data) {
  return {
    type: ActionTypes.updateSegment,
    data: data
  }
}

const initialState = {
  id: null,
  name: null,
  predicates: [],
  initialPredicates: [],
  jwt: null,
}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
    case ActionTypes.updateSegment: {
      return Object.assign({}, state, action.data)
    }
    default:
      return state;
  }
}