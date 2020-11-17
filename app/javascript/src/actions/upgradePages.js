import actionTypes from '../constants/action_types'

export function lockPage (message) {
  return (dispatch, getState) => {
    dispatch(
      setLockPage(message)
    )
  }
}

export function clearLocks () {
  return (dispatch, getState) => {
    dispatch(setLockPage({}))
  }
}

function setLockPage (data) {
  return { type: actionTypes.SetUpgradePage, data: data }
}

const initialState = {}

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case actionTypes.SetUpgradePage:
      return action.data
    default:
      return state
  }
}
