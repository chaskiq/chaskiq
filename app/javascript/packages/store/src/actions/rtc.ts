import { ActionType } from '../constants/action_types';

const initialState = {};

export function updateRtcEvents(data) {
  return (dispatch, getState) => {
    const conversation = getState().conversation;
    if (conversation && conversation.key === data.conversation_id) {
      dispatch(dispatchRtcEvent(data));
    }
  };
}

function dispatchRtcEvent(data) {
  return {
    type: 'RTC_UPDATE',
    data: data,
  };
}

// Reducer
export default function reducer(state = initialState, action: ActionType = {}) {
  switch (action.type) {
    case 'RTC_UPDATE': {
      return Object.assign({}, state, action.data);
    }
    default:
      return state;
  }
}
