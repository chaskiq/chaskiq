import { Socket as PhoenixSocket } from 'phoenix';

import { appendConversation } from '@chaskiq/store/src/actions/conversations';
import { updateCampaignEvents } from '@chaskiq/store/src/actions/campaigns';
import { updateRtcEvents } from '@chaskiq/store/src/actions/rtc';
import { setSubscriptionState } from '@chaskiq/store/src/actions/paddleSubscription';
import { updateAppUserPresence } from '@chaskiq/store/src/actions/app_users';
import { PUSH_EVENT } from '@chaskiq/store/src/graphql/mutations';
import graphql from '@chaskiq/store/src/graphql/client';

import {
  camelizeKeys,
  dispatchUpdateConversationData,
} from '@chaskiq/store/src/actions/conversation';

//@ts-ignore
const withAbsintheSocket = require('@absinthe/socket');

export function createSubscription(match, accessToken) {
  const chaskiq_cable_url = document.querySelector(
    'meta[name="chaskiq-ws"]'
    //@ts-ignore
  ).content;

  return {
    events: null,
    //@ts-ignore
    cable: withAbsintheSocket.create(
      new PhoenixSocket(`${chaskiq_cable_url}`, {
        params: { token: accessToken },
      })
    ),
  };
}

export const eventsSubscriber = (appId, cableApp, dispatch, fetchApp) => {
  const operation = `
  subscription eventSubscription($appKey: String!) {
    agentEvents(appKey: $appKey) {
      type
      event
      conversation_typing
      message{
        conversationKey
        message{
          htmlContent
          textContent
          serializedContent
          blocks
          state
          data
          action
        }
        source
        readAt
        createdAt
        privateNote
        stepId
        triggerId
        fromBot
        appUser{
          id
          avatarUrl
          kind
          displayName
        }
        source
        key
        messageSource {
          name
          state
          fromName
          fromEmail
          serializedContent
        }
        emailMessageId
      }
    }
  }
  `;

  // This example uses a subscription, but the functionallity is the same for
  // all operation types (queries, mutations and subscriptions)

  //@ts-ignore
  const notifier = withAbsintheSocket.send(cableApp.cable, {
    operation,
    variables: { appKey: appId },
  });

  const logEvent = (eventName) => (...args) => console.log(eventName, ...args);

  const handleResult = (eventName) => (...args) => {
    //console.log(args)

    //@ts-ignore
    const data = args[0].data.agentEvents;
    console.log(eventName, data);

    switch (data.type) {
      case 'conversation_part':
        return dispatch(appendConversation(data.message));
      case 'conversations:update_state':
        return dispatch(
          dispatchUpdateConversationData(camelizeKeys(data.data))
        );
      //case 'presence':
      //  return updateUser(camelizeKeys(data.data))
      //case 'rtc_events':
      //  return dispatch(updateRtcEvents(data))
      //case 'campaigns':
      //  return dispatch(updateCampaignEvents(data.data))
      //case 'paddle:subscription':
      //  fetchApp(() => {
      //    dispatch(setSubscriptionState(data.data))
      //  })
      //  return null
      default:
        return null;
    }
  };

  //@ts-ignore
  cableApp.events = withAbsintheSocket.observe(cableApp.cable, notifier, {
    onAbort: logEvent('abort'),
    onError: logEvent('error'),
    onStart: logEvent('open'),
    onResult: handleResult('result'),
  });

  // window.cable = CableApp
};

export function destroySubscription(subscription) {
  subscription.cable.phoenixSocket.disconnect();
}

export function sendPush(name, { props, events, data }) {
  console.log('WILL SEND PUSH EVENT: ', data);

  graphql(
    PUSH_EVENT,
    {
      appKey: props.app.key,
      id: name,
      data: data,
    },
    {
      success: (data) => {
        console.log('SENT PUSH EVENT: ', data);
      },
      error: () => {},
    }
  );
}
