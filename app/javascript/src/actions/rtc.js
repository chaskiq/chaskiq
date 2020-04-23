const initialState = { }

export function updateRtcEvents (data) {
  return {
    type: 'RTC_UPDATE',
    data: data
  }
}

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case 'RTC_UPDATE': {
      return Object.assign({}, state, action.data)
    }
    default:
      return state
  }
}