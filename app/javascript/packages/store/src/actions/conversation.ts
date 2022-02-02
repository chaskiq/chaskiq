import ActionTypes from '../constants/action_types';
import graphql from '../graphql/client';

import { CONVERSATION } from '../graphql/queries';

import {
  INSERT_COMMMENT,
  INSERT_APP_BLOCK_COMMMENT,
  ASSIGN_USER,
  INSERT_NOTE,
  UPDATE_CONVERSATION_STATE,
  TOGGLE_CONVERSATION_PRIORITY,
  TYPING_NOTIFIER,
  UPDATE_CONVERSATION_TAG_LIST,
} from '../graphql/mutations';

import { camelCase } from 'lodash';

const pling = new Audio('/sounds/BLIB.wav');

export const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelizeKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {}
    );
  }
  return obj;
};

export function getConversation(options, cb) {
  return (dispatch, getState) => {
    setLoading(true);

    const conversationMeta = getState().conversation.meta;
    const nextPage = conversationMeta ? conversationMeta.next_page || 1 : 1;

    graphql(
      CONVERSATION,
      {
        appKey: getState().app.key,
        id: options.id,
        page: nextPage,
      },
      {
        success: (data) => {
          const conversation = data.app.conversation;

          const newConversation = Object.assign(
            {},
            {
              collection:
                nextPage > 1
                  ? getState().conversation.collection.concat(
                      conversation.messages.collection
                    )
                  : conversation.messages.collection,
              meta: conversation.messages.meta,
              loading: false,
            },
            conversation
          );
          // console.log('newConversation', newConversation, nextPage)
          dispatch(dispatchGetConversations(newConversation));

          if (cb) cb();
        },
        error: () => {},
      }
    );
  };
}

export function updateConversationTagList(options, cb) {
  return (dispatch, getState) => {
    graphql(
      UPDATE_CONVERSATION_TAG_LIST,
      {
        appKey: getState().app.key,
        conversationId: options.id,
        tagList: options.tagList,
      },
      {
        success: (data) => {
          const tags = data.updateConversationTags.conversation.tagList;
          // updateTags(tags)

          dispatch(
            dispatchUpdateConversations({
              ...getState().conversation,
              tagList: tags,
            })
          );

          dispatch(
            dispatchUpdateListItemTagList({
              id: options.id,
              tagList: tags,
            })
          );
          if (cb) cb();
        },
        error: () => {},
      }
    );
  };
}

export function clearConversation(cb) {
  return (dispatch, _getState) => {
    dispatch(dispatchGetConversations({}));
    if (cb) cb();
  };
}

export function typingNotifier(cb) {
  return (dispatch, getState) => {
    graphql(
      TYPING_NOTIFIER,
      {
        appKey: getState().app.key,
        id: getState().conversation.key,
      },
      {
        success: () => {
          cb && cb();
        },
        error: (error) => {
          console.log(error);
        },
      }
    );
  };
}

export function insertComment(comment, cb) {
  return (dispatch, getState) => {
    graphql(
      INSERT_COMMMENT,
      {
        appKey: getState().app.key,
        id: getState().conversation.key,
        message: comment,
      },
      {
        success: (data) => {
          // console.log(data)
          dispatch(appendMessage(data.insertComment.message));
          cb();
        },
        error: (error) => {
          console.log(error);
        },
      }
    );
  };
}

export function insertAppBlockComment(comment, cb) {
  return (dispatch, getState) => {
    const blocks = {
      type: 'app_package',
      app_package: comment.provider.name,
      values: comment.values,
      schema: comment.provider.schema,
      wait_for_input: comment.provider.wait_for_input,
    };

    graphql(
      INSERT_APP_BLOCK_COMMMENT,
      {
        appKey: getState().app.key,
        id: getState().conversation.key,
        controls: blocks,
      },
      {
        success: (data) => {
          console.log(data);
          cb && cb();
        },
        error: (error) => {
          console.log(error);
          cb && cb();
        },
      }
    );
  };
}

export function insertNote(comment, cb) {
  return (dispatch, getState) => {
    graphql(
      INSERT_NOTE,
      {
        appKey: getState().app.key,
        id: getState().conversation.id,
        message: comment,
      },
      {
        success: (data) => {
          console.log(data);
          cb();
        },
        error: (error) => {
          console.log(error);
        },
      }
    );
  };
}

export function appendMessage(data, cb?: any) {
  return (dispatch, getState) => {
    const newData = camelizeKeys(data);
    // update existing message
    if (getState().conversation.collection.find((o) => o.key === newData.key)) {
      const newCollection = getState().conversation.collection.map((o) => {
        if (o.key === newData.key) {
          return newData;
        } else {
          return o;
        }
      });

      const newMessages = Object.assign({}, getState().conversation, {
        collection: newCollection,
      });

      dispatch(dispatchGetConversations(newMessages));
    } else {
      // if (getState().current_user.email !== newData.appUser.email) {
      if (newData.appUser.kind !== 'agent') {
        playSound();
      }

      const newMessages = Object.assign({}, getState().conversation, {
        collection: [newData].concat(getState().conversation.collection),
      });

      // debugger
      dispatch(dispatchGetConversations(newMessages));

      if (cb) cb();
    }
  };
}

export function assignUser(_key, _cb) {
  return (_dispatch, _getState) => {};
}

export function setLoading(val) {
  return (dispatch, getState) => {
    dispatch(
      dispatchUpdateConversations({
        ...getState().conversation,
        loading: val,
      })
    );
  };
}

export function updateTags(val) {
  return (dispatch, getState) => {
    dispatch(
      dispatchUpdateConversations({
        ...getState().conversation,
        tagList: val,
      })
    );
  };
}

export function toggleConversationPriority(_key, _cb) {
  return (_dispatch, _getState) => {};
}

export function updateConversationState(state, cb) {
  return (dispatch, getState) => {
    graphql(
      UPDATE_CONVERSATION_STATE,
      {
        appKey: getState().app.key,
        conversationId: getState().conversation.id,
        state: state,
      },
      {
        success: (data) => {
          const conversation = data.updateConversationState.conversation;

          const newConversation = Object.assign(
            {},
            getState().conversation,
            conversation
          );
          dispatch(dispatchGetConversations(newConversation));

          if (cb) cb(newConversation);
        },
        error: () => {},
      }
    );
  };
}

export function updateConversationPriority(cb) {
  return (dispatch, getState) => {
    graphql(
      TOGGLE_CONVERSATION_PRIORITY,
      {
        appKey: getState().app.key,
        conversationId: getState().conversation.id,
      },
      {
        success: (data) => {
          const conversation = data.toggleConversationPriority.conversation;
          const newConversation = Object.assign(
            {},
            getState().conversation,
            conversation
          );
          dispatch(dispatchGetConversations(newConversation));
          if (cb) cb(newConversation);
        },
        error: () => {},
      }
    );
  };
}

export function assignAgent(id, cb) {
  return (dispatch, getState) => {
    graphql(
      ASSIGN_USER,
      {
        appKey: getState().app.key,
        conversationId: getState().conversation.id,
        appUserId: id,
      },
      {
        success: (data) => {
          const conversation = data.assignUser.conversation;
          const newConversation = Object.assign(
            {},
            getState().conversation,
            conversation
          );
          dispatch(dispatchGetConversations(newConversation));
          if (cb) cb(data.assignUser.conversation);
        },
        error: () => {},
      }
    );
  };
}

function dispatchUpdateListItemTagList(data) {
  return {
    type: ActionTypes.UpdateConversationItem,
    data: data,
  };
}

function dispatchGetConversations(data) {
  return {
    type: ActionTypes.GetConversation,
    data: data,
  };
}

function dispatchUpdateConversations(data) {
  return {
    type: ActionTypes.GetConversation,
    data: data,
  };
}

export function dispatchUpdateConversationData(data) {
  return {
    type: ActionTypes.UpdateConversation,
    data: data,
  };
}

export function playSound() {
  pling.volume = 0.4;
  pling.play();
}

// Reducer
export default function reducer(
  state: any = {},
  action: {
    type: string;
    data: any;
  } = null
) {
  switch (action.type) {
    case ActionTypes.GetConversation: {
      return action.data;
    }
    case ActionTypes.UpdateConversation: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
