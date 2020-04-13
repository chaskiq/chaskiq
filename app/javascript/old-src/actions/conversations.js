import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'

import { 
    CONVERSATIONS, 
    CONVERSATION_WITH_LAST_MESSAGE,
    AGENTS
  } from "../graphql/queries"


import {
  playSound,
  appendMessage
} from './conversation'

import {uniqBy} from 'lodash'

export function getConversations(options, cb){

  const {page} = options
  return (dispatch, getState) => {
    const {sort, filter , meta} = getState().conversations

    const nextPage = page || meta.next_page || 1

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

export function appendConversation(data, cb){
   
    return (dispatch, getState)=>{
      
      const conversation = getState().conversations.collection.find((o)=> 
        o.key === data.conversationKey 
      )

      let newMessages = null
     
      // add new or update existing
      if(!conversation){
        graphql(CONVERSATION_WITH_LAST_MESSAGE, {
          appKey: getState().app.key,
          id: data.conversationKey 
        },{
          success: (data)=>{
            newMessages = [data.app.conversation].concat(getState().conversations.collection)
            dispatch(appendConversationDispatcher(newMessages))
          }
        })

      } else {
        const newConversations = getState().conversations.collection.map((o)=>{
          if(o.key === data.conversationKey){
            o.lastMessage = data
            return o
          }else{
            return o
          }
        })

        if(conversation.key === getState().conversation.key){
          dispatch(appendMessage(data))  
        }
        dispatch(appendConversationDispatcher(newConversations))
      }

      if(getState().conversation.key != data.conversationKey ){
        if(data.appUser.kind != "agent")
          playSound()  
      }
    }
}

export function updateConversationsData(data, cb){
  return (dispatch, getState)=>{
    dispatch(dispatchDataUpate(data))
    cb ? cb() : null
  }
}

export function updateConversationItem(data){
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UpdateConversationItem,
      data: data
    })
  }
}

export function clearConversations(data){
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.ClearConversations,
      data: data
    })
  }
}

function appendConversationDispatcher(data){
  // TODO: the data here is filteres to get uniq array by conv key
  // but the real deal solution might be a redux queue to append sequencially
  // https://redux-loop.js.org/docs/recipes/ActionQueue.html
  return {
      type: ActionTypes.AppendConversation,
      data: uniqBy(data, 'key')
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

    case ActionTypes.AppendConversation: {
      return Object.assign({}, state, {collection: action.data})
    }

    case ActionTypes.ClearConversations: {
      return Object.assign({}, state, {collection: []})
    }

    default:
      return state;
  }
}
