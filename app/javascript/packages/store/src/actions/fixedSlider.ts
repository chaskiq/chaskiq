import { ActionType } from '../constants/action_types';

export function toggleTheme(data, cb = null) {
  return (dispatch, _getState) => {
    dispatch({
      type: 'FIXED_SLIDER',
      data: data,
    });
    if (cb) cb();
  };
}

const initialState = {
  open: false,
  package: null,
};

// Reducer
export default function reducer(state = initialState, action: ActionType = {}) {
  switch (action.type) {
    case 'FIXED_SLIDER':
      return action.data;
    default:
      return state;
  }
}
