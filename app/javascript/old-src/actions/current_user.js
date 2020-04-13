import axios from 'axios'
import graphql from '../graphql/client'

import {
  CURRENT_USER
} from "../graphql/queries"

import {doSignout} from './auth'


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
        console.error("error retriving current user. Sign out!", 
          data.data.errors)
        dispatch(doSignout())
        //window.location = "/users/sign_in"
        //console.log("error!", data.data.errors);
      },
      fatal: (response)=>{
        dispatch(doSignout())
      }
    })
  }
}

export function clearCurrentUser(){
  return (dispatch, getState) => {
    dispatch(successAuthentication({}))
  }
}

function successAuthentication(data) {
  return { type: SET_CURRENT_USER, data: data }
}


// Reducer
export default function reducer(state, action = {}) {
  const initialState = {}

  switch (action.type) {
    case SET_CURRENT_USER:
      return action.data
    default: 
      return state === undefined ? initialState : state
  }
}
