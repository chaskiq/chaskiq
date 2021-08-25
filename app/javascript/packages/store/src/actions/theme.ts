import { ActionType } from "../constants/action_types"

export function toggleTheme(data, cb=null) {
  return (dispatch, _getState) => {
    dispatch({
      type: 'THEME',
      data: data,
    })
    if (cb) cb()
  }
}

const initialState = 'light'

// Reducer
export default function reducer(state = initialState, action : ActionType = {}) {
  switch (action.type) {
    case 'THEME':
      return action.data
    default:
      return state
  }
}
