import ActionTypes, { ActionType } from '../constants/action_types';

export function setSubscriptionState(data) {
  return (dispatch, _getState) => {
    dispatch({
      type: ActionTypes.SetSubscriptionState,
      data: data,
    });
  };
}

export function clearSubscriptionState() {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.ClearSubscriptionState,
      data: {},
    });
  };
}

const subscriptionState = {};

// Reducer
export default function reducer(
  state = subscriptionState,
  action: ActionType = {}
) {
  switch (action.type) {
    case ActionTypes.SetSubscriptionState:
      return Object.assign({}, state, action.data);
    case ActionTypes.ClearSubscriptionState:
      return subscriptionState;
    default:
      return state;
  }
}
