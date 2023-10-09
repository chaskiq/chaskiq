import { FetchRequest } from '@rails/request.js';
import UAParser from 'ua-parser-js';
import {
  setCookie,
  getCookie,
  deleteCookie,
} from './packages/messenger/src/client_messenger/cookies';
import { embedCss } from './embedStyle';
import {
  getDiff,
  setLastActivity,
} from './packages/messenger/src/client_messenger/activityUtils';

function getBrowserVisibilityProp() {
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    return 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    return 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    return 'webkitvisibilitychange';
  }
}

function getBrowserDocumentHiddenProp() {
  if (typeof document.hidden !== 'undefined') {
    return 'hidden';
  } else if (typeof document.msHidden !== 'undefined') {
    return 'msHidden';
  } else if (typeof document.webkitHidden !== 'undefined') {
    return 'webkitHidden';
  }
}

function getIsDocumentHidden() {
  return !document[getBrowserDocumentHiddenProp()];
}

const primeOpenedHTML = `
  <div style="transition: all 0.2s ease-in-out 0s;">
    <svg onclick="Chaskiq.close()" viewBox="0 0 60 60" palette="[object Object]" style="height: 28px; width: 28px; margin: 13px;">
      <path fill="#f3f3f3" d="M10 25.465h13a1 1 0 1 0 0-2H10a1 1 0 1 0 0 2zM36 29.465H10a1 1 0 1 0 0 2h26a1 1 0 1 0 0-2zM36 35.465H10a1 1 0 1 0 0 2h26a1 1 0 1 0 0-2z">
      </path>
      <path fill="#f3f3f3" d="M54.072 2.535l-34.142-.07c-3.27 0-5.93 2.66-5.93 5.93v5.124l-8.07.017c-3.27 0-5.93 2.66-5.93 5.93v21.141c0 3.27 2.66 5.929 5.93 5.929H12v10a1 1 0 0 0 1.74.673l9.704-10.675 16.626-.068c3.27 0 5.93-2.66 5.93-5.929v-.113l5.26 5.786a1.002 1.002 0 0 0 1.74-.673v-10h1.07c3.27 0 5.93-2.66 5.93-5.929V8.465a5.937 5.937 0 0 0-5.928-5.93zM44 40.536a3.934 3.934 0 0 1-3.934 3.929l-17.07.07a1 1 0 0 0-.736.327L14 53.949v-8.414a1 1 0 0 0-1-1H5.93A3.934 3.934 0 0 1 2 40.606V19.465a3.935 3.935 0 0 1 3.932-3.93L15 15.516h.002l25.068-.052a3.934 3.934 0 0 1 3.93 3.93v21.142zm14-10.93a3.934 3.934 0 0 1-3.93 3.929H52a1 1 0 0 0-1 1v8.414l-5-5.5V19.395c0-3.27-2.66-5.93-5.932-5.93L16 13.514v-5.12a3.934 3.934 0 0 1 3.928-3.93l34.141.07h.002a3.934 3.934 0 0 1 3.93 3.93v21.142z">
      </path>
    </svg>
  </div>
  `;

const primeClosedHTML = `
  <div style="transition: all 0.2s ease-in-out 0s; transform: rotate(180deg);">
    <svg onclick="Chaskiq.open()" viewBox="0 0 212.982 212.982" width="512" height="512" palette="[object Object]" style="height: 26px; width: 21px; margin: 13px 16px;">
      <path d="M131.804 106.491l75.936-75.936c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.491 81.18 30.554 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.989 6.99-6.989 18.323 0 25.312l75.937 75.936-75.937 75.937c-6.989 6.99-6.989 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0l75.937-75.937 75.937 75.937c6.989 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.322 0-25.312l-75.936-75.936z" fill="#f3f3f3" fill-rule="evenodd" clip-rule="evenodd"></path>
    </svg>
  </div>
`;

window.Chaskiq = window.Chaskiq || {
  frameTemplate: function (url) {
    return `
      <div id="messenger-frame" class="css-13u6xjo">
        <iframe src="${url}" width="100%" height="100%" style="border:none"></iframe>
      </div>
    `;
  },
  getTemplate: function (url) {
    return `
      <div id="chaskiq-messenger" class="fixed w-[376px] right-[14px] bottom-[14px] z-[2147483647]">
        <div id="frame-wrapper">
          ${this.frameTemplate(url)}
        </div>
        
        <div id="prime-wrapper">
          <div id="chaskiq-prime" class="cache-emo-1ttjy62">
            ${primeClosedHTML}
          </div>
        </div>
      </div>
    `;
  },
  getOptions: function () {
    this.options;
  },
  setOptions: function (options) {
    this.options = options;
  },
  toggle: function (e) {
    const frame = document.getElementById('messenger-frame');

    if (frame) {
      frame.remove();
    } else {
      const wrapper = document.querySelector('#frame-wrapper');
      const url = `${this.options.domain}/messenger/${this.options.app_id}?token=${this.userData.token}`;
      wrapper.innerHTML = this.frameTemplate(url);
    }
    console.log('TOGGLE');

    /*if (!this.state.open && this.props.kind !== 'AppUser') {
      // console.log("idleSessionRequired", this.idleSessionRequired())
      if (this.idleSessionRequired() && this.isElapsedTimeUp()) {
        // console.log('DIFF GOT', getDiff());
        setLastActivity();
        this.props.reset(true, true);

        // trigger close for other tabs
        window.localStorage.setItem('chaskiqTabClosedAt', Math.random() + '');

        return true;
      }
    }*/
  },
  dispatchEvent(key, data = {}) {
    const event = new Event(key, data);
    document.dispatchEvent(event);
  },
  close: function (e) {
    document.getElementById('chaskiq-prime').innerHTML = primeClosedHTML;
    this.toggle();
  },
  open: function (e) {
    document.getElementById('chaskiq-prime').innerHTML = primeOpenedHTML;
    this.toggle();
  },
  setup: async function (cb) {
    const url = `${this.options.domain}/messenger/${this.options.app_id}/auth`;
    const request = new FetchRequest('post', url, {
      body: JSON.stringify({ name: 'Request.JS' }),
    });
    request.addHeader('session-id', this.getSession());
    request.addHeader('user-data', JSON.stringify(this.options.data));

    const response = await request.perform();
    if (response.ok) {
      const json = await response.json;

      cb && cb(json);
      // Do whatever do you want with the response body
      // You also are able to call `response.html` or `response.json`, be aware that if you call `response.json` and the response contentType isn't `application/json` there will be raised an error.
    }
  },
  ping: function () {
    //precenseSubscriber(this.App, { ctx: this });
    //eventsSubscriber(this.App, { ctx: this });
    this.locationChangeListener();
    this.dispatchEvent('chaskiq:boot');
  },
  initPopupWidget: function (dataObj) {
    this.ping();
    this.addStyle();
    this.setup((data) => {
      console.log(data);
      this.userData = data;

      if (!data.enabled_for_user) {
        console.log('MESSENGER NOT ENABLED FOR USER');
        return;
      }

      const url = `${this.options.domain}/messenger/${this.options.app_id}?token=${data.token}`;
      const templateString = this.getTemplate(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateString, 'text/html');
      const chaskiqElement = doc.body.firstChild;
      const selector = dataObj.selector || 'ChaskiqMessengerRoot';

      let g = document.querySelector(dataObj.selector);
      if (!g) {
        g = document.createElement('div');
        g.setAttribute('id', selector);
        document.body.appendChild(g);
      }
      g.appendChild(chaskiqElement);
    });
  },
  load: function (options) {
    this.options = options;
    console.log('Chaskiq boot!');
    window.Chaskiq.initPopupWidget(options);
    this.setTabId();
    this.visibilityHandler();
    this.listenForStorageChanges();
    setLastActivity();
    this.checkActivityInterval = setInterval(
      this.checkActivity.bind(this),
      1000
    ); // Check every second
    this.unloadListener();
  },
  reset: function (wipe_cookie = false, open = false) {
    if (wipe_cookie) deleteCookie(this.cookieNamespace());
    this.setReady(false);
    //openOnLoad.current = open;

    //// send event to other tabs
    //// if(open) window.localStorage.setItem('chaskiqTabClosedAt', Math.random() + '');
  },
  shutdown: function () {
    deleteCookie(this.cookieNamespace());
    deleteCookie(this.sessionCookieNamespace());
    // setReady(false); // this will reset the session, but we really dont that dat to happen
    // what will happen is that the livechat will be still connected

    // this.openOnLoad.current = open;
  },
  cookieNamespace: function () {
    // old app keys have hypens, we get rid of this
    const app_id = this.options.app_id.replace('-', '');
    return `chaskiq_session_id_${app_id}`;
  },
  cookieSessionNamespace: function () {
    // old app keys have hypens, we get rid of this
    const app_id = this.options.app_id.replace('-', '');
    return `chaskiq_ap_session_${app_id}`;
  },
  sessionCookieNamespace: function () {
    const app_id = this.options.app_id.replace('-', '');
    return `chaskiq_ap_session_${app_id}`;
  },
  getSession: function () {
    // cookie rename, if we wet an old cookie update to new format and expire it
    const oldCookie = getCookie('chaskiq_session_id');
    if (getCookie('chaskiq_session_id')) {
      this.checkCookie(oldCookie); // will append a appkey
      deleteCookie('chaskiq_session_id');
    }
    return getCookie(this.cookieNamespace()) || '';
  },

  checkCookie: function (val) {
    //console.log("SET COOKIE ", val, this.cookieNamespace())
    setCookie(this.cookieNamespace(), val, 365);

    if (!getCookie(this.cookieNamespace())) {
      // falbacks to direct hostname
      // console.info("cookie not found, fallabck to:")
      setCookie(this.cookieNamespace(), val, 365, window.location.hostname);
    }
  },

  toggleMessenger: function () {
    // idle support not for appUsers
    /*if (!this.state.open && this.props.kind !== 'AppUser') {
      // console.log("idleSessionRequired", this.idleSessionRequired())
      if (this.idleSessionRequired() && this.isElapsedTimeUp()) {
        // console.log('DIFF GOT', getDiff());
        setLastActivity();
        this.props.reset(true, true);

        // trigger close for other tabs
        window.localStorage.setItem('chaskiqTabClosedAt', Math.random() + '');

        return true;
      }
    }

    this.setState(
      {
        open: !this.state.open,
        // display_mode: "conversations",
      },
      this.clearInlineConversation
    );*/
  },

  idleSessionRequired: function () {
    /*const inboundData = this.state.appData?.inboundSettings?.visitors;
    return (
      inboundData?.idle_sessions_enabled && inboundData?.idle_sessions_after
    );*/
  },
  isElapsedTimeUp: function () {
    /*return (
      getDiff() >
      this.state.appData?.inboundSettings?.visitors?.idle_sessions_after * 60
    );*/
  },
  setTimer: function (timer, tabId) {
    this.timer = timer;
    // console.log(window.localStorage.getItem("chaskiqTabId"), tabId)
    if (window.localStorage.getItem('chaskiqTabId') === tabId) {
      //this.props.reset(true);
      setTimeout(() => {
        // this.closeMessenger();
        window.localStorage.setItem('chaskiqTabClosedAt', Math.random() + '');
      }, 200);
    }
  },
  checkActivity: function () {
    const idleSessionTime = 1;
    const timeoutLapse = idleSessionTime * 60;

    //if (!['Visitor', 'Lead'].includes(props.kind)) return;
    //if (!props?.inboundSettings?.visitors?.idle_sessions_enabled) return;

    if (getDiff() >= timeoutLapse) {
      console.log(
        'idle triggered by inactivity',
        this.tabId,
        window.localStorage.getItem('chaskiqTabId')
      );
      this.setTimer(this.timer, this.tabId);
    }

    if (this.timer == timeoutLapse) {
      setLastActivity();
    }

    if (this.timer == 0) {
      console.log(
        'idle triggered on tab',
        this.tabId,
        window.localStorage.getItem('chaskiqTabId')
      );
      this.setTimer(this.timer, this.tabId);
      // window.localStorage.setItem('chaskiqTabId', props.tabId);
    }
  },

  setTabId: function () {
    this.tabId = Math.random() + '';
  },
  storeTabIdToLocalStorage: function () {
    console.log('STORING TAB', this.tabId);
    window.localStorage.setItem('chaskiqTabId', this.tabId);
  },

  visibilityHandler: function () {
    this.isVisible = getIsDocumentHidden();

    const onVisibilityChange = () => {
      this.isVisible = getIsDocumentHidden();
      if (this.isVisible) {
        console.log('STORED TAB', this.isVisible);
        this.storeTabIdToLocalStorage();
      }
      console.log('VISIBILITY CHANGED', this.isVisible);
    };

    const visibilityChange = getBrowserVisibilityProp();
    document.addEventListener(visibilityChange, onVisibilityChange, false);
  },
  storageListener: function (event) {
    console.log('STORAGE LISTENER CHANGED', event);
  },
  listenForStorageChanges: function () {
    window.addEventListener('storage', this.storageListener);
  },

  locationChangeListener: function () {
    /* These are the modifications: */
    window.history.pushState = ((f) =>
      function pushState() {
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushState'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
      })(window.history.pushState);

    window.history.replaceState = ((f) =>
      function replaceState() {
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replaceState'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
      })(window.history.replaceState);

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('locationchange'));
    });

    window.addEventListener('locationchange', () => {
      //this.registerVisit();
    });
  },

  pushEvent: async function (eventType, data) {
    /*const url = `${this.options.domain}/messenger/${this.options.app_id}/events?event=${eventType}&token=${this.userData.token}`

    const request = new FetchRequest('post', url, {
      body: JSON.stringify(data),
    });
    const response = await request.perform();
    if (response.ok) {
      console.log("send message ok")
    } else {
      console.error("error sending message")
    }*/
    const iframeElement = document.querySelector('#messenger-frame iframe');
    iframeElement.contentWindow.postMessage({ eventType, data }, '*');
  },
  addStyle: function () {
    const style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      // for IE
      style.styleSheet.cssText = embedCss;
    } else {
      // for other browsers
      style.appendChild(document.createTextNode(embedCss));
    }
    document.head.appendChild(style);
  },
  onUnload: function () {
    console.log('UNLOAD MESSENGER');
    window.localStorage.removeItem('chaskiqTabId');
  },
  unloadListener: function () {
    window.addEventListener('beforeunload', this.onUnload);
    //return () => {
    //  window.removeEventListener('beforeunload', onUnload);
    //};
  },
  cleanup: function () {
    //clean all the listeners here!
    // window.removeEventListener('beforeunload', onUnload);
  },
};
