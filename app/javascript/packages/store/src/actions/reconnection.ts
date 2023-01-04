import actionTypes, { ActionType } from '../constants/action_types';

export function setReconnection() {
  return (dispatch, getState) => {
    dispatch({
      type: actionTypes.SetReconnection,
      data: getState().reconnect + 1,
    });
  };
}

// Reducer
export default function reducer(state = 0, action: ActionType = {}) {
  switch (action.type) {
    case actionTypes.SetReconnection:
      return action.data;
    default:
      return state;
  }
}
