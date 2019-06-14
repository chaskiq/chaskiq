import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client'

import {
  CONVERSATION, 
  AGENTS
} from "../graphql/queries"

import { 
  INSERT_COMMMENT, 
  ASSIGN_USER,
  INSERT_NOTE,
  UPDATE_CONVERSATION_STATE,
  TOGGLE_CONVERSATION_PRIORITY
} from '../graphql/mutations'

export function insertComment(key, cb){
  return (dispatch, getState) => {
  }
}

export function assignUser(key, cb){
  return (dispatch, getState) => {
  }
}

export function insertNote(key, cb){
  return (dispatch, getState) => {
  }
}

export function updateConversationState(key, cb){
  return (dispatch, getState) => {
  }
}

export function toggleConversationPriority(key, cb){
  return (dispatch, getState) => {
  }
}

function dispatchGetConversations(data) {
  return {
    type: ActionTypes.GetConversation,
    data: data
  }
}


const initialState = {

}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
    case ActionTypes.GetConversation: {
      return action.data
    }
    default:
      return state;
  }
}
