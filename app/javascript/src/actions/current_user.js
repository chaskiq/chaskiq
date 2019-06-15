import axios from 'axios'
import graphql from '../graphql/client'

import {
  CURRENT_USER
} from "../graphql/queries"


// Actions
const SET_CURRENT_USER = 'auth/SET_CURRENT_USER'

// Action Creators
export function getCurrentUser() {
  return (dispatch, getState) => {    
    graphql(CURRENT_USER, {}, {
      success: (data)=>{
        dispatch(successAuthentication(data.userSession ))
      },
      error: (data)=>{
        //window.location = "/users/sign_in"
        console.log("error!", data.data.errors);
      }
    })
  }
}

export function clearCurrentUser(){
  return (dispatch, getState) => {
    dispatch(successAuthentication(initialState))
  }
}

function successAuthentication(data) {
  return { type: SET_CURRENT_USER, data: data }
}

const initialState = {}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return action.data
    default: return state
  }
}
