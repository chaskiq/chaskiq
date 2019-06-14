import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'

import { 
    CONVERSATIONS, 
    AGENTS
  } from "../graphql/queries"

export function getConversations(cb){

  return (dispatch, getState) => {
    const {sort, filter , meta} = getState().conversations

    const nextPage = meta.next_page || 1

    dispatch(dispatchDataUpate({loading: true}))

    graphql(CONVERSATIONS, { 
      appKey: getState().app.key, 
      page: nextPage,
      sort: sort,
      filter: filter
    }, {
      success: (data)=>{
        const conversations = data.app.conversations
        const newData = {
                          collection: nextPage > 1 ? 
                            getState()
                            .conversations
                            .collection
                            .concat(conversations.collection) : 
                             conversations.collection,
                          meta: conversations.meta,
                          loading: false
                        }

        dispatch(dispatchGetConversations(newData))
        
        /*this.setState({
          conversations: nextPage > 1 ? 
          this.state.conversations.concat(conversations.collection) : 
          conversations.collection,
          meta: conversations.meta,
          loading: false
        })*/

        cb ? cb() : null        
      }
    })
 
  }
}

export function updateConversationsData(data, cb){
  return (dispatch, getState)=>{
    dispatch(dispatchDataUpate(data))
    cb ? cb() : null
  }
}

function dispatchGetConversations(data) {
  return {
    type: ActionTypes.GetConversations,
    data: data
  }
}

function dispatchDataUpate(data) {
  return {
    type: ActionTypes.UpdateConversations,
    data: data
  }
}


const initialState = {
  meta: {},
  sort: 'newest',
  filter: 'opened',
  loading: false,
  collection: []
}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
    case ActionTypes.GetConversations: {
      return Object.assign({}, state, action.data)
    }

    case ActionTypes.UpdateConversations: {
      return Object.assign({}, state, action.data)
    }
    default:
      return state;
  }
}
