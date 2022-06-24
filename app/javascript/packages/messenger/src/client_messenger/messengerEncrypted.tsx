import ChaskiqMessenger from './messenger';
import { setCookie, getCookie, deleteCookie } from './cookies';

import { AUTH } from './graphql/queries';
import GraphqlClient from './graphql/client';
//import { graphqlUrl } from './shared/absintheSubscription';
import { graphqlUrl } from './shared/actionCableSubscription';

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
  cookieNamespace: () => void;
  getSession: () => string;
  checkCookie: (value: string) => void;
  unload: () => void;
  sendCommand: (action: string, data: any) => void;
  defaultHeaders: any;
  graphqlClient: any;

  constructor(props) {
    this.props = props;

    const currentLang =
      this.props.lang || navigator.language || navigator['userLanguage'];

    this.cookieNamespace = () => {
      // old app keys have hypens, we get rid of this
      const app_id = this.props.app_id.replace('-', '');
      return `chaskiq_session_id_${app_id}`;
    };

    this.getSession = () => {
      // cookie rename, if we wet an old cookie update to new format and expire it
      const oldCookie = getCookie('chaskiq_session_id');
      if (getCookie('chaskiq_session_id')) {
        this.checkCookie(oldCookie); // will append a appkey
        deleteCookie('chaskiq_session_id');
      }
      return getCookie(this.cookieNamespace()) || '';
    };

    this.checkCookie = (val) => {
      //console.log("SET COOKIE ", val, this.cookieNamespace())
      setCookie(this.cookieNamespace(), val, 365);

      if (!getCookie(this.cookieNamespace())) {
        // falbacks to direct hostname
        //console.info("cookie not found, fallabck to:")
        setCookie(this.cookieNamespace(), val, 365, window.location.hostname);
      }
    };

    this.defaultHeaders = {
      app: this.props.app_id,
      'enc-data': this.props.data || '',
      'user-data': JSON.stringify(this.props.data),
      'session-id': this.getSession(),
      lang: currentLang,
    };

    this.graphqlClient = new GraphqlClient({
      config: this.defaultHeaders,
      url: graphqlUrl(this.props.domain),
    });

    this.graphqlClient.send(
      AUTH,
      {
        lang: currentLang,
      },
      {
        success: (data) => {
          const user = data.messenger.user;
          if (user.kind !== 'AppUser') {
            if (user.sessionId) {
              this.checkCookie(user.sessionId);
            } else {
              deleteCookie(this.cookieNamespace());
            }
          }

          const messenger = new ChaskiqMessenger(
            Object.assign({}, user, {
              app_id: this.props.app_id,
              encData: this.props.data,
              encryptedMode: true,
              domain: this.props.domain,
              ws: this.props.ws,
              lang: user.lang,
              wrapperId: this.props.wrapperId || 'ChaskiqMessengerRoot',
            })
          );

          messenger.render();
        },
        errors: (e) => {
          console.log('Error', e);
        },
      }
    );

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
  }
}
