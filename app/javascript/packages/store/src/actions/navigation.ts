import ActionTypes, { ActionType } from '../constants/action_types';

// Action Creators
export function setCurrentSection(url) {
  return (dispatch, _getState) => {
    dispatch({
      type: ActionTypes.SetCurrentPage,
      data: { current_section: url },
    });
  };
}

export function setCurrentPage(url) {
  return (dispatch, _getState) => {
    dispatch({
      type: ActionTypes.SetCurrentPage,
      data: { current_page: url },
    });
  };
}

const navigationState = {
  current_page: null,
  current_section: null,
};

// Reducer
export default function reducer(
  state = navigationState,
  action: ActionType = {}
) {
  switch (action.type) {
    case ActionTypes.SetCurrentPage:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}
