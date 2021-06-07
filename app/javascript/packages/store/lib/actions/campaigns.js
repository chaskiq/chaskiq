const initialState = { }

export function updateCampaignEvents (data) {
  return (dispatch) => {
    dispatch(dispatchCampaignEvent(data))
  }
}

function dispatchCampaignEvent (data) {
  return {
    type: 'CAMPAIGN_EVENT',
    data: data
  }
}

// Reducer
export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case 'CAMPAIGN_EVENT': {
      return Object.assign({}, state, action.data)
    }
    default:
      return state
  }
}
