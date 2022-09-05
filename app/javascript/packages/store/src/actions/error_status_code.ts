import actionTypes, { ActionType } from '../constants/action_types';

export const UNAUTHORIZED = 'unauthorized';
export const UNAUTHENTICATED = 'unauthenticated';

export function setErrorCode(code) {
  return (dispatch) => {
    dispatch(setCode(code));
  };
}

export function clearCode() {
  return (dispatch) => {
    dispatch(setCode(''));
  };
}

function setCode(code) {
  return { type: actionTypes.SetCode, data: code };
}

// Reducer
export default function reducer(state = {}, action: ActionType = {}) {
  switch (action.type) {
    case actionTypes.SetCode:
      return action.data;
    default:
      return state;
  }
}
