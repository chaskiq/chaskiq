import actioncable from 'actioncable';
import { appendConversation } from '@chaskiq/store/src/actions/conversations';
import { updateCampaignEvents } from '@chaskiq/store/src/actions/campaigns';
import { updateRtcEvents } from '@chaskiq/store/src/actions/rtc';
import { setSubscriptionState } from '@chaskiq/store/src/actions/paddleSubscription';
import { updateAppUserPresence } from '@chaskiq/store/src/actions/app_users';
import { createNotification } from '@chaskiq/store/src/actions/notifications';

import {
  camelizeKeys,
  dispatchUpdateConversationData,
} from '@chaskiq/store/src/actions/conversation';

export function createSubscription(match, accessToken) {
  const chaskiq_cable_url = document.querySelector(
    'meta[name="chaskiq-ws"]'
    //@ts-ignore
  ).content;

  return {
    events: null,
    cable: actioncable.createConsumer(
      `${chaskiq_cable_url}?app=${match.params.appId}&token=${accessToken}`
    ),
  };
}

export function destroySubscription(cableApp) {
  cableApp.events.unsubscribe();
  cableApp.agentEvents.unsubscribe();
}

export const eventsSubscriber = (appId, cableApp, dispatch, fetchApp) => {
  // unsubscribe event cable ust in case
  if (cableApp.events) {
    cableApp.events.unsubscribe();
  }

  // unsubscribe agent cable ust in case
  if (cableApp.agentEvents) {
    cableApp.agentEvents.unsubscribe();
  }

  cableApp.events = cableApp.cable.subscriptions.create(
    {
      channel: 'EventsChannel',
      app: appId,
    },
    {
      connected: () => {
        console.log('connected to events');
        //setSubscribed(true);
      },
      disconnected: () => {
        console.log('disconnected from events');
        //setSubscribed(false);
      },
      received: (data) => {
        // console.log('received', data)
        switch (data.type) {
          case 'conversation_part':
            return dispatch(appendConversation(camelizeKeys(data.data)));
          case 'conversations:update_state':
            return dispatch(
              dispatchUpdateConversationData(camelizeKeys(data.data))
            );
          case 'presence':
            return dispatch(updateAppUserPresence(camelizeKeys(data.data)));
          case 'rtc_events':
            return dispatch(updateRtcEvents(data));
          case 'campaigns':
            return dispatch(updateCampaignEvents(data.data));
          case 'paddle:subscription':
            fetchApp(() => {
              dispatch(setSubscriptionState(data.data));
            });
            return null;
          case 'notification':
            dispatch(createNotification(data.data));
            return null;
          case data.type.match(/\/package\/\S+/)?.input:
            const popup = document.getElementById('package-frame')
              ?.contentWindow;
            popup && popup.postMessage(data, '*');
          default:
            console.log('unhandled', data);
            return null;
        }
      },
      notify: () => {
        console.log('notify!!');
      },
      handleMessage: () => {
        console.log('handle message');
      },
    }
  );

  // agent channel
  cableApp.agentEvents = cableApp.cable.subscriptions.create(
    {
      channel: 'AgentChannel',
      app: appId,
    },
    {
      connected: () => {
        console.log('connected to agent events');
        //setSubscribed(true);
      },
      disconnected: () => {
        console.log('disconnected from agent events');
        //setSubscribed(false);
      },
      received: (data) => {
        // console.log('received', data)
        switch (data.type) {
          case 'notification':
            dispatch(createNotification(data.data));
            return null;
          default:
            console.log('unhandled', data);
            return null;
        }
      },
      notify: () => {
        console.log('notify!!');
      },
      handleMessage: () => {
        console.log('handle message');
      },
    }
  );
};

export function sendPush(name, { props, events, data }) {
  events && events.perform(name, data);
}

export function sendAgentPush(name, { props, events, data }) {
  events && events.perform(name, data);
}
