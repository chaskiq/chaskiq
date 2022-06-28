import { DependencyList, useMemo } from 'react';
import actioncable from 'actioncable';
import { useSelector } from 'react-redux';
import Events from 'events';

export type ChannelType =
  | 'EventsChannel'
  | 'MessengerEventsChannel'
  | 'PresenceChannel'
  | 'AgentChannel';

export function useEventBroker(
  configProvider: () => { channel: ChannelType },
  deps: DependencyList
): EventBroker | null {
  const app = useSelector((state: any) => state.app);
  const accessToken = useSelector((state: any) => state.auth?.accessToken);
  const cableUrl = useMemo(() => {
    if (!app) {
      console.warn('Unable to find app in redux store');
    }

    if (!accessToken) {
      console.warn('Unable to find accessToken in redux store');
    }

    const cableUrl = getCableUrl();

    return `${cableUrl}?app=${app.key}&token=${accessToken}`;
  }, [app, accessToken]);
  const config = useMemo(() => {
    return configProvider();
  }, deps);
  const configKey = useMemo(() => {
    return Object.keys(config).reduce((all, key) => {
      if (all.length > 0) {
        all += '_';
      }

      return `${all}${key}:${config[key]}`;
    }, '');
  }, [config]);
  const broker = useMemo(() => {
    if (!cableUrl) {
      return null;
    }

    if (!eventBrokerCache[configKey]) {
      eventBrokerCache[configKey] = new EventBroker(cableUrl, config);
    }

    return eventBrokerCache[configKey];
  }, [configKey, config, cableUrl]);


  return broker;
}

const eventBrokerCache: Record<string, EventBroker> = {};

const getCableUrl = () => {
  return (document.querySelector('meta[name="chaskiq-ws"]') as any).content;
};

class EventBroker {
  private consumer: any;
  private subcription: any;
  private emitter: Events;

  constructor(
    cableUrl: string,
    config: {
      channel: ChannelType;
    }
  ) {
    this.emitter = new Events();

    this.consumer = actioncable.createConsumer(cableUrl);

    this.subcription = this.consumer.subscriptions.create(config, {
      connected: () => {
        console.log(`MessageBroker connected to ${config.channel}`);
      },
      disconnected: () => {
        console.log(`MessageBroker disconnected from ${config.channel}`);
      },
      received: (data) => {
        this.emitter.emit(data.type, data.data);
      },
    });
  }

  dispose = () => {
    this.subcription.unsubscribe();
    this.consumer.disconnect();

    this.subcription = null;
    this.consumer = null;
  };

  on = (eventName: string, handler: (data: any) => void) => {
    this.emitter.on(eventName, handler);

    return () => {
      this.off(eventName, handler);
    };
  };

  off = (eventName: string, handler: (data: any) => void) => {
    this.emitter.off(eventName, handler);
  };

  emit = (eventName: string, data: any) => {
    this.subcription.perform(eventName, data);
  };
}
