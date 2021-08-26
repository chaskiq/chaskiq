import actionTypes, {ActionType} from '../constants/action_types'

export function errorMessage(message) {
  return (dispatch) => {
    dispatch(
      setMessage({
        message: message,
        variant: 'error',
        placement: defaultPlacement(),
      })
    )
  }
}

export function warningMessage(message) {
  return (dispatch) => {
    dispatch(
      setMessage({
        message: message,
        variant: 'warning',
        placement: defaultPlacement(),
      })
    )
  }
}

export function infoMessage(message) {
  return (dispatch) => {
    dispatch(
      setMessage({
        message: message,
        variant: 'info',
        placement: defaultPlacement(),
      })
    )
  }
}

export function successMessage(message) {
  return (dispatch) => {
    dispatch(
      setMessage({
        message: message,
        variant: 'success',
        placement: defaultPlacement(),
      })
    )
  }
}

export function clearStatusMessage() {
  return (dispatch) => {
    dispatch(setMessage({}))
  }
}

function defaultPlacement() {
  return {
    vertical: 'top',
    horizontal: 'center',
  }
}

function setMessage(data) {
  return { type: actionTypes.SetStatusMessage, data: data }
}


// Reducer
export default function reducer(state = {}, action : ActionType = {}) {
  switch (action.type) {
    case actionTypes.SetStatusMessage:
      return action.data
    default:
      return state
  }
}
