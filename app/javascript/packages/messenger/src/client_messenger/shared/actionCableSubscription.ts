import actioncable from 'actioncable';
import { toCamelCase } from '@chaskiq/components/src/utils/caseConverter';

export function graphqlUrl(domain) {
  return `${domain}/api/graphql`;
}

export function createSubscription(props, userData) {
  return {
    cable: actioncable.createConsumer(
      `${props.ws}?enc=${props.encData}&user_data=${btoa(userData)}&app=${
        props.app_id
      }&session_id=${props.sessionId}`
    ),
  };
}

export function destroySubscription(app) {
  app.cable && app.cable.subscriptions.consumer.disconnect();
}

export function eventsSubscriber(app, { ctx }) {
  app.events = app.cable.subscriptions.create(
    ctx.cableDataFor({ channel: 'MessengerEventsChannel' }),
    {
      connected: () => {
        ctx.handleConnected();
        // ctx.processTriggers()
      },
      disconnected: () => {
        console.log('disconnected from events xx');
      },
      received: (data) => {
        console.log('RECEIVED: ', data);
        switch (data.type) {
          case 'messages:receive':
            ctx.setState({
              availableMessages: data.data,
              messages: data.data,
              availableMessage: data.data[0],
            });
            break;
          case 'tours:receive':
            ctx.receiveTours([data.data]);
            break;
          case 'banners:receive':
            ctx.receiveBanners(data.data);
            break;
          case 'triggers:receive':
            ctx.receiveTrigger(data.data);
            break;
          case 'conversations:conversation_part':
            const newMessage = toCamelCase(data.data);
            setTimeout(() => ctx.receiveMessage(newMessage), 100);
            break;
          case 'conversations:update_state':
            ctx.handleConversationState(toCamelCase(data.data));
          case 'conversations:typing':
            ctx.handleTypingNotification(toCamelCase(data.data));
            break;
          case 'conversations:unreads':
            ctx.receiveUnread(data.data);
            break;
          case 'rtc_events':
            return ctx.updateRtcEvents(data);
          case 'true':
            return true;
          default:
        }
        // console.log(`received event`, data)
      },
      notify: () => {
        console.log('notify event!!');
      },
      handleMessage: (message) => {
        console.log('handle event message', message);
      },
    }
  );
}

export function precenseSubscriber(app, { ctx }) {
  app.precense = app.cable.subscriptions.create(
    ctx.cableDataFor({ channel: 'PresenceChannel' }),
    {
      connected: () => {
        // console.log("connected to presence")
      },
      disconnected: () => {
        console.log('disconnected from presence');
      },
      received: (data) => {
        console.log(`received ${data}`);
      },
      notify: () => {
        console.log('notify!!');
      },
      handleMessage: (_message) => {
        console.log('handle message');
      },
    }
  );
}

export function sendPush(name, { ctx, app, data }) {
  app.events && app.events.perform(name, data);
}
