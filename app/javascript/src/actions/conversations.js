import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'

import { 
    CONVERSATIONS, 
    CONVERSATION_WITH_LAST_MESSAGE,
    AGENTS
  } from "../graphql/queries"


import {
  playSound
} from './conversation'

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

export function appendConversation(data, cb){
   
    return (dispatch, getState)=>{
  
      const conversation = getState().conversations.collection.find((o)=> 
        o.id === data.conversationId 
      )

      let newMessages = null
     
      // add new or update existing
      if(!conversation){
        graphql(CONVERSATION_WITH_LAST_MESSAGE, {
          appKey: getState().app.key,
          id: data.conversationId
        },{
          success: (data)=>{
            newMessages = [data.app.conversation].concat(getState().conversations.collection)
            dispatch(appendConversationDispatcher(newMessages))
          }
        })

      } else {
        newMessages = getState().conversations.collection.map((o)=>{
          if(o.id === data.conversationId){
            o.lastMessage = data
            return o
          }else{
            return o
          }
        })

        dispatch(appendConversationDispatcher(newMessages))
      }


      if(getState().conversation.id != data.conversationId){
    
        if(data.appUser.kind === "app_user")
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

function appendConversationDispatcher(data){
  return {
    type: ActionTypes.AppendConversation,
    data: data
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
    default:
      return state;
  }
}
