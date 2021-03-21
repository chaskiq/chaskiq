
export function toggleDrawer (data, cb) {
  return (dispatch, _getState) => {
    dispatch({
      type: 'DRAWER',
      data: data
    })
    if (cb) cb()
  }
}

const initialState = {}

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case 'DRAWER':
      return action.data
    default:
      return state
  }
}
