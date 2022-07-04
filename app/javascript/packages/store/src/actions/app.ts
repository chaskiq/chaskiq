import ActionTypes, { ActionType } from '../constants/action_types';
import graphql from '../graphql/client';
import { APP } from '../graphql/queries';
import { UPDATE_APP } from '../graphql/mutations';

import I18n from '../../../../src/shared/FakeI18n';
import { successMessage, errorMessage } from './status_messages';
import { isEmpty } from 'lodash';

export function setApp(key, cb = null) {
  return (dispatch, _getState) => {
    graphql(
      APP,
      { appKey: key },
      {
        success: (data) => {
          dispatch(getApp(data.app));
          if (cb && cb.success) {
            cb.success(data.app);
          }
        },
        error: (err) => {
          if (cb && cb.error) {
            cb.success(err);
          }
        },
      }
    );
  };
}

export function clearApp() {
  return (dispatch, _getState) => {
    dispatch(getApp(null));
  };
}

function getApp(app) {
  return {
    type: ActionTypes.GetApp,
    data: app,
  };
}

export function updateApp(appParams, cb = null) {
  return (dispatch, getState) => {
    graphql(
      UPDATE_APP,
      {
        appKey: getState().app.key,
        appParams: appParams,
      },
      {
        success: (data) => {
          const newObject = Object.assign({}, data.appsUpdate.app, {
            errors: data.appsUpdate.errors,
          });
          dispatch(getApp(newObject));
          if (isEmpty(data.appsUpdate.errors)) {
            dispatch(successMessage(I18n.t('status_messages.updated_success')));
          }
          cb && cb();
        },
        error: (error) => {
          dispatch(errorMessage(I18n.t('status_messages.updated_error')));
          console.log('ERRR Updating app', error);
          cb && cb();
        },
      }
    );
  };
}

export function appPackageEventReceived({ type: eventName }) {
  return {
    type: ActionTypes.AppPackageEvent,
    data: eventName,
  };
}

const initialState = null;

// Reducer
export default function reducer(state = initialState, action: ActionType = {}) {
  switch (action.type) {
    case ActionTypes.GetApp: {
      return action.data;
    }
    case ActionTypes.AppPackageEvent: {
      const inboxApps = state.inboxApps

      const updatedInboxApps = inboxApps.map((inboxApp) => {
        if (!inboxApp.definitions || inboxApp.definitions.length === 0) {
          return inboxApp;
        }
        const { definitions: [{ events }] } = inboxApp;
        if (!events) {
          return inboxApp;
        }
        const subscribed = events.some((event) => event === action.data)

        if (!subscribed) {
          return inboxApp;
        }
        return { ...inboxApp };
      });

      return { ...state, inboxApps: updatedInboxApps };
    }
    default:
      return state;
  }
}
