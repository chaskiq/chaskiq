import ChaskiqMessenger from './messenger';

type ChaskiqMessengerProps = {
  lang: string;
  app_id: string;
  data: any;
  domain: string;
  ws: string;
  wrapperId?: string;
};
export default class ChaskiqMessengerEncrypted {
  props: ChaskiqMessengerProps;
  unload: () => void;
  sendCommand: (action: string, data: any) => void;
  shutdown: () => void;

  constructor(props) {
    this.props = props;

    const messenger = new ChaskiqMessenger({
      app_id: this.props.app_id,
      encData: this.props.data,
      data: this.props.data,
      encryptedMode: true,
      domain: this.props.domain,
      ws: this.props.ws,
      lang: this.props.lang,
      wrapperId: this.props.wrapperId || 'ChaskiqMessengerRoot',
    });

    this.unload = () => {
      this.sendCommand('unload', {});
    };

    this.sendCommand = (action, data = {}) => {
      const event = new CustomEvent('chaskiq_events', {
        bubbles: true,
        detail: { action: action, data: data },
      });
      window.document.body.dispatchEvent(event);
    };

    this.shutdown = () => {
      this.sendCommand('shutdown', null);
    };

    messenger.render();
  }
}
