import actioncable from 'actioncable';

export function createSubscription() {
  const chaskiq_cable_url = document.querySelector(
    'meta[name="chaskiq-ws"]'
    //@ts-ignore
  ).content;

  const appId = document.querySelector(
    'meta[name="app-id"]'
    //@ts-ignore
  ).content;

  const accessToken = JSON.parse(localStorage.AUTH).auth.accessToken;

  return {
    events: null,
    cable: actioncable.createConsumer(
      `${chaskiq_cable_url}?app=${appId}&token=${accessToken}`
    ),
  };
}

export function destroySubscription(cableApp) {
  cableApp.events.unsubscribe();
}

export const eventsSubscriber = (cableApp, cb) => {
  const appId = document.querySelector(
    'meta[name="app-id"]'
    //@ts-ignore
  ).content;

  // unsubscribe cable ust in case
  if (cableApp.events) {
    cableApp.events.unsubscribe();
  }

  cableApp.events = cableApp.cable.subscriptions.create(
    {
      channel: 'EventsChannel',
      app: appId,
    },
    {
      connected: () => {
        console.log('connected to events');
      },
      disconnected: () => {
        console.log('disconnected from events');
      },
      received: (data) => {
        switch (data.type) {
          case '/package/TwilioPhone':
            cb(data);
          default:
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
