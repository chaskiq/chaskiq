import ActionTypes, { ActionType } from '../constants/action_types';
import graphql from '../graphql/client';

import { PREDICATES_SEARCH } from '../graphql/mutations';

import { dispatchSegmentUpdate } from './segments';
import { parseJwt } from '../jwt';

export function searchAppUsers(options, cb) {
  return (dispatch, getState) => {
    const { page } = options;
    const appKey = getState().app.key;

    const segment = getState().segment;
    const jwtData = segment.jwt
      ? parseJwt(segment.jwt).data
      : segment.predicates;

    // skip search
    if (jwtData.find((o) => !o.comparison || !o.value)) {
      const incompleteSegment = Object.assign({}, segment, {
        predicates: jwtData,
      });
      dispatch(dispatchSegmentUpdate(incompleteSegment));
      return;
    }

    const predicates_data = {
      data: {
        predicates: jwtData.filter((o) => o.comparison),
      },
    };

    options = {
      appKey: appKey,
      search: predicates_data,
      jwt: jwtData,
      page: page,
    };

    dispatch(dispatchLoading());

    graphql(PREDICATES_SEARCH, options, {
      success: (data) => {
        const appUsers = data.predicatesSearch.appUsers;
        let newData = Object.assign(appUsers, { searching: false }); //, segment)

        const newSegment = Object.assign({}, segment, {
          predicates: jwtData,
        });

        dispatch(dispatchSegmentUpdate(newSegment));

        newData = Object.assign(newData); //, segment)

        dispatch(dispatchSearchAppUsers(newData));

        cb && cb();
      },
      error: () => {},
    });
  };
}

export function updateAppUserPresence(userData) {
  return (dispatch, getState) => {
    const newCollection = getState().app_users.collection.map((o) => {
      if (userData.id === o.id) {
        o.online = userData.state === 'online';
        return o;
      } else {
        return o;
      }
    });

    dispatch(dispatchAppUsersUpdatePresence(newCollection));
  };
}

function dispatchLoading() {
  return {
    type: ActionTypes.initSearchAppUsers,
    data: {
      collection: [],
      meta: {},
      searching: true,
    },
  };
}

function dispatchSearchAppUsers(data) {
  return {
    type: ActionTypes.searchAppUsers,
    data: data,
  };
}

function dispatchAppUsersUpdatePresence(data) {
  return {
    type: ActionTypes.UpdatePresence,
    data: data,
  };
}

// Reducer
export default function reducer(
  state = {
    collection: [],
    meta: {},
    searching: true,
  },
  action: ActionType = {}
) {
  switch (action.type) {
    case ActionTypes.searchAppUsers: {
      return Object.assign({}, state, action.data);
    }
    case ActionTypes.initSearchAppUsers: {
      return Object.assign({}, state, action.data);
    }
    case ActionTypes.UpdatePresence: {
      return Object.assign({}, state, { collection: action.data });
    }
    default:
      return state;
  }
}
