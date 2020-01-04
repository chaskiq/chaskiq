import actionTypes from '../constants/action_types'

export function errorMessage(message){
  return (dispatch, getState)=>{
    dispatch(setMessage({
      message: message, 
      variant: 'error',
      placement: defaultPlacement()
    }))
  }
}

export function warningMessage(message){
  return (dispatch, getState)=>{
    dispatch(setMessage({
      message: message, 
      variant: 'warning',
      placement: defaultPlacement()
    }))
  }
}

export function infoMessage(message){
  return (dispatch, getState)=>{
    dispatch(setMessage({
      message: message, 
      variant: 'info', 
      placement: defaultPlacement()}
    ))
  }
}

export function successMessage(message){
  return (dispatch, getState)=>{
    dispatch(setMessage({
      message: message, 
      variant: 'success',
      placement: defaultPlacement()
    }))
  }
}

export function clearStatusMessage(message){
  return (dispatch, getState)=>{
    dispatch(setMessage({}))
  }
}

function defaultPlacement(){
  return {
          vertical: 'top',
          horizontal: 'center',
         }
}

function setMessage(data) {
  return { type: actionTypes.SetStatusMessage, data: data }
}

const initialState = {}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case actionTypes.SetStatusMessage:
      return action.data
    default: return state
  }
}
