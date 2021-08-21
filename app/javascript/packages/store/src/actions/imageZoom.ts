import { ActionType } from "../constants/action_types"

export function setImageZoom(data) {
  return (dispatch, _getState) => {
    dispatch(setImage(data))
  }
}

function setImage(data) {
  return {
    type: 'SET_ZOOM_IMAGE',
    data: data,
  }
}

// Reducer
export default function reducer(state = {}, action: ActionType = {}) {
  switch (action.type) {
    case 'SET_ZOOM_IMAGE':
      return action.data
    default:
      return state
  }
}
