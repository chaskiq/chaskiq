import actionTypes, { ActionType } from '../constants/action_types';

export function createNotification({
  message,
  subject,
  timeout,
  placement,
  actions,
}) {
  return (dispatch) => {
    dispatch(
      setMessage({
        subject: subject,
        message: message,
        variant: 'success',
        placement: placement || defaultPlacement(),
        sound: defaultSound(),
        action: defaultAction(),
        timeout: timeout || 3500,
        actions: actions,
      })
    );
  };
}

export function clearNotification() {
  return (dispatch) => {
    dispatch(setMessage({}));
  };
}

function defaultSound() {
  return 'pling';
}

function defaultAction() {
  return {
    type: 'dismiss',
  };
}

function defaultPlacement() {
  return {
    vertical: 'top',
    horizontal: 'center',
  };
}

function setMessage(data) {
  return { type: actionTypes.SetNotification, data: data };
}

// Reducer
export default function reducer(state = {}, action: ActionType = {}) {
  switch (action.type) {
    case actionTypes.SetNotification:
      return action.data;
    default:
      return state;
  }
}
