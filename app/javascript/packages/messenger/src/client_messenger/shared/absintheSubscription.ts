const withAbsintheSocket = require('@absinthe/socket');
import { Socket as PhoenixSocket } from 'phoenix';
import { PUSH_EVENT } from '../graphql/queries';

export function graphqlUrl(domain) {
  return `${domain}/graphql`;
}

export function createSubscription(props, userData) {
  return {
    cable: withAbsintheSocket.create(
      new PhoenixSocket(`${props.ws}`, {
        params: {
          //@ts-ignore
          user_data: btoa(userData),
          app: props.app_id,
          session_id: props.sessionId,
        },
      })
    ),
  };
}

export function destroySubscription(app) {
  app.cable.channel.leave();
}

export function eventsSubscriber(app, { ctx }) {
  const operation = `
      subscription messengerSubscription{
        appUsersEvents{
          type
          event
          conversations_unreads
          conversation_typing
          trigger
          conversation {
            id
            key
            state
            readAt
            closedAt
            priority
            assignee {
              id
              name
              avatarUrl
            }
          }
          conversation_part{
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

  const notifier = withAbsintheSocket.send(app.cable, {
    operation,
    variables: {},
  });

  const logEvent = (eventName) => (...args) => console.log(eventName, ...args);

  const handleResult = (eventName) => (...args) => {
    //console.log(args)

    //@ts-ignore
    const data = args[0].data.appUsersEvents;
    console.log(eventName, data);

    switch (data.type) {
      case 'conversations:conversation_part':
        const newMessage = data.conversation_part;
        setTimeout(() => ctx.receiveMessage(newMessage), 100);
        break;
      case 'conversations:unreads':
        ctx.receiveUnread(data.conversation_unreads);
        break;
      case 'conversations:update_state':
        ctx.handleConversationState(data.conversation);
      case 'conversations:typing':
        ctx.handleTypingNotification(data.conversation_typing);
        break;
      case 'tours:receive':
        ctx.receiveTours([data.event]);
        break;
      case 'banners:receive':
        ctx.receiveBanners(data.event);
        break;
      case 'triggers:receive':
        ctx.receiveTrigger(data);
        break;
      case 'messages:receive':
        ctx.setState({
          availableMessages: data.event,
          messages: data.event,
          availableMessage: data.event[0],
        });
        break;

      default:
        return null;
    }
  };

  const handleStart = (eventName) => (...args) => {
    console.log(eventName, ...args);

    ctx.handleConnected();
  };

  app.events = withAbsintheSocket.observe(app.cable, notifier, {
    onAbort: logEvent('abort'),
    onError: logEvent('error'),
    onStart: handleStart('open'),
    onResult: handleResult('result'),
  });
}

export function precenseSubscriber(app, { ctx }) {
  console.log('PRESCENSE NOT IMPLEMENTED');
}

export function sendPush(name, { ctx, app, data }) {
  console.log('WILL SEND PUSH EVENT: ', data);
  ctx.graphqlClient.send(
    PUSH_EVENT,
    {
      appKey: ctx.props.app_id,
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
