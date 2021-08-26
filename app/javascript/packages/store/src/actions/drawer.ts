import { ActionType } from '../constants/action_types';

export function toggleDrawer(data, cb = null) {
  return (dispatch, _getState) => {
    dispatch({
      type: 'DRAWER',
      data: data,
    });
    if (cb) cb();
  };
}

// Reducer
export default function reducer(state = {}, action: ActionType = {}) {
  switch (action.type) {
    case 'DRAWER':
      return action.data;
    default:
      return state;
  }
}
