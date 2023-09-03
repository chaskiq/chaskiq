import actionTypes, { ActionType } from '../constants/action_types';

export function lockPage(message) {
  return (dispatch) => {
    dispatch(setLockPage(message));
  };
}

export function clearLocks() {
  return (dispatch) => {
    dispatch(setLockPage({}));
  };
}

function setLockPage(data) {
  return { type: actionTypes.SetUpgradePage, data: data };
}

// Reducer
export default function reducer(state = {}, action: ActionType = {}) {
  switch (action.type) {
    case actionTypes.SetUpgradePage:
      return action.data;
    default:
      return state;
  }
}
