import { FetchRequest } from '@rails/request.js';
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
import UrlPattern from 'url-pattern';
import UAParser from 'ua-parser-js';

import TourManager from './tour_manager';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${url}`));
    document.head.appendChild(script);
  });
}

// Function to load a CSS file
function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

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

const primeClosedHTML = `
<div id="primeContainer" class="prime-container">
  <div class="prime-status cache-emo-xlbvmj" data-content="0">0</div>
  <svg class="prime-toggle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
  </svg>
</div>
`;

window.Chaskiq = window.Chaskiq || {
  bannerFrame: function (url) {
    let result;
    const { placement, mode } = this.banner.banner_data;

    if (placement === 'top' && mode === 'floating') {
      result = 'top: 8';
    } else if (placement === 'top') {
      result = 'top: 0';
    } else if (placement === 'bottom' && mode === 'floating') {
      result = 'bottom: 8';
    } else if (placement === 'bottom' || placement === 'fixed') {
      result = 'bottom: 0';
    }

    const height = mode === 'floating' ? '88px' : '60px';
    const style = `
      position: fixed;
      left: 0px;
      width: 100%;
      height: ${height};
      border: transparent;
      z-index: 4000000000;
      ${result};`;

    return `<iframe src="${url}" 
      width="100%" 
      data-cy="banner-wrapper"
      height="100%" 
      style="${style}" 
      id="chaskiqBannerFrame"></iframe>`;
  },

  frameTemplate: function (url) {
    return `
      <div id="messenger-frame" class="css-13u6xjo">
        <iframe src="${url}" width="100%" height="100%" style="border:none"></iframe>
      </div>
    `;
  },
  userAutoMessageFrame: function (url) {
    const style = `
      display: block;
      border: 0px;
      z-index: 1000;
      width: 350px;
      position: absolute;
      height: 70vh;
      bottom: 49px;
      right: 6px;
    `;
    return `<iframe src="${url}" id="chaskiq-user-auto-messages" width="100%" height="100%" style="${style}" id="chaskiqBannerFrame"></iframe>`;
  },
  getTemplate: function (url) {
    return `
      <div id="chaskiq-messenger-body" class="fixed w-[376px] right-[14px] bottom-[14px] z-[2147483647]">
        <div id="frame-wrapper" data-open="false" style="display:none;">
          ${this.frameTemplate(url)}
        </div>
        
        <div id="prime-wrapper">
          <div id="chaskiq-prime" class="cache-emo-1ttjy62" style="display:none;" onclick="Chaskiq.toggle()">
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
    const wrapper = document.querySelector('#frame-wrapper');

    console.log('INIT: TOGGLE', wrapper.dataset.open);

    if (wrapper && wrapper.dataset.open === 'true') {
      this.close(wrapper);
    } else {
      this.open(wrapper);
    }
    console.log('END: TOGGLE', wrapper.dataset.open);

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
    //document.getElementById('chaskiq-prime').innerHTML = primeClosedHTML;
    const wrapper = document.querySelector('#frame-wrapper');
    console.log('INIT: TOGGLE', wrapper.dataset.open);

    if (wrapper && !wrapper.dataset.open === 'false') return;
    ////const url = `${this.options.domain}/messenger/${this.options.app_id}?token=${this.userData.token}`;
    ////wrapper.innerHTML = this.frameTemplate(url);
    wrapper.style.display = 'none';
    wrapper.dataset.open = 'false';
    this.pushEvent('messenger:toggled', false);

    const container = document.getElementById('primeContainer');
    const svg = container.querySelector('.prime-toggle');
    svg.setAttribute('viewBox', '0 0 24 24');
    container.classList.remove('prime-rotated');
    //svg.setAttribute('onclick', 'togglePrime()');
    // Update the SVG path for the "opened" state
    svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" 
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
    />`;
  },
  open: function (e) {
    //document.getElementById('chaskiq-prime').innerHTML = primeOpenedHTML;
    const wrapper = document.querySelector('#frame-wrapper');
    console.log('OPEN THIS', wrapper.dataset.open);

    if (wrapper && wrapper.dataset.open === 'true') return;

    wrapper.style.display = '';
    wrapper.dataset.open = 'true';
    this.pushEvent('messenger:toggled', true);

    // Toggle the class for rotation animation
    const container = document.getElementById('primeContainer');
    const svg = container.querySelector('.prime-toggle');

    svg.setAttribute('viewBox', '0 0 24 24');
    //svg.setAttribute('onclick', 'Chaskiq.toggle()');
    // Update the SVG path for the "closed" state
    svg.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />';
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

  setup: async function (cb) {
    const url = `${this.options.domain}/messenger/${this.options.app_id}/auth`;
    const request = new FetchRequest('post', url, {
      body: JSON.stringify({ name: 'Chaskiq Auth Request' }),
    });
    request.addHeader('session-id', this.getSession());
    request.addHeader('user-data', JSON.stringify(this.options.data));
    request.addHeader('user-lang', this.options.lang);

    const response = await request.perform();
    if (response.ok) {
      const json = await response.json;

      const u = json.user;
      if (u.kind === 'AppUser') {
        if (u.session_value) {
          setCookie(this.cookieSessionNamespace(), u.session_value, 7);
        }
      } else {
        if (u.session_id) {
          this.checkCookie(u.session_id);
        } else {
          deleteCookie(this.cookieNamespace());
        }
      }

      cb && cb(json);

      // Do whatever do you want with the response body
      // You also are able to call `response.html` or `response.json`, be aware that if you call `response.json` and the response contentType isn't `application/json` there will be raised an error.
    }
  },
  ping: function () {
    //precenseSubscriber(this.App, { ctx: this });
    //eventsSubscriber(this.App, { ctx: this });
    this.locationChangeListener();
    this.listenFrameEvents();
    this.listenChaskiqEvents();
    this.dispatchEvent('chaskiq:boot');
  },
  listenChaskiqEvents: function () {
    document.addEventListener('chaskiq_events', (event) => {
      // @ts-ignore
      const { data, action } = event.detail;
      switch (action) {
        case 'wakeup':
          this.open();
          break;
        case 'toggle':
          this.toggle();
          break;
        case 'convert':
          //this.convertVisitor(data);
          break;
        case 'trigger':
          this.requestTrigger(data);
          break;
        case 'unload':
          // this.unload()
          break;
        case 'shutdown':
          this.shutdown();
          break;
        default:
          break;
      }
    });
  },
  initPopupWidget: function (dataObj) {
    this.ping();
    this.addStyle();
    this.setup((data) => {
      console.log(data);
      this.userData = data;
      this.banner = null;
      this.inline_conversations = data.inline_conversations;

      if (!data.enabled_for_user) {
        console.log('MESSENGER NOT ENABLED FOR USER');
        return;
      }

      this.token = data.token;
      const url = `${this.options.domain}/messenger/${this.options.app_id}?token=${data.token}&locale=${data.locale}`;
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

      setTimeout(() => this.updateDimensions(), 500);
      window.addEventListener('resize', this.updateDimensions.bind(this));

      // send tour opener for editor
      window.opener &&
        window.opener.postMessage({ type: 'ENABLE_MANAGER_TOUR' }, '*');

      document.querySelector('#chaskiq-prime').style.display = 'block';
    });
  },

  // check url pattern before trigger tours
  receiveTours(tours) {
    const filteredTours = tours.filter((o) => {
      // eslint-disable-next-line no-useless-escape
      const pattern = new UrlPattern(o.url.replace(/^.*\/\/[^\/]+/, ''));
      const url = document.location.pathname;
      return pattern.match(url);
    });

    if (filteredTours.length > 0) this.tours = filteredTours;
  },

  fetchBanner(id) {
    this.pushEvent('messenger:fetch_banner', id);
  },

  requestTrigger(data) {
    this.pushEvent('messenger:request_trigger', data);
  },

  getBanner() {
    return (
      localStorage.getItem('chaskiq-banner') &&
      JSON.parse(localStorage.getItem('chaskiq-banner'))
    );
  },

  getBannerID() {
    const banner = this.getBanner();
    return banner?.id;
  },

  receiveBanners(banner) {
    this.persistBannerCache(banner);
    this.banner = banner;
    //this.setState({ banner: banner }, () => {
    this.pushEvent('messenger:track_open', {
      trackable_id: this.banner.id,
    });

    this.loadBanner();
    //});
  },

  persistBannerCache(banner) {
    localStorage.setItem('chaskiq-banner', JSON.stringify(banner));
  },

  clearBannerCache() {
    this.banner = null;
    localStorage.removeItem('chaskiq-banner');
  },

  closeBanner() {
    if (!this.banner) return;

    this.pushEvent('messenger:track_close', {
      trackable_id: this.banner.id,
    });

    this.clearBannerCache();

    document.querySelector('#chaskiqBannerFrame').remove();
  },

  bannerActionClick(url) {
    window.open(url, '_blank');
    this.pushEvent('messenger:track_click', {
      trackable_id: this.banner.id,
    });
  },

  loadUserTour(data) {
    const pattern = new UrlPattern(data.url.replace(/^.*\/\/[^\/]+/, ''));
    const currentLocation = document.location.pathname;
    if (pattern.match(currentLocation)) {
      const url = this.messengerUrl(`/campaigns/${data.id}`);
      this.pushEvent('messenger:load_user_tour', { url: url });
    }
  },

  messengerUrl(path, params = {}) {
    const newParams = { ...params, token: this.token };

    const paramsAsUrl = new URLSearchParams(newParams).toString();

    return `${this.options.domain}/messenger/${this.options.app_id}/${path}?${paramsAsUrl}`;
  },

  loadUserAutoMessages(data) {
    const ids = data.data.map((o) => o.id).join(',');
    const url = `${this.options.domain}/messenger/${this.options.app_id}/campaigns/user_auto_messages?ids=${ids}&token=${this.token}`;

    const existingFrame = document.querySelector('#chaskiq-user-auto-messages');

    if (existingFrame) {
      existingFrame.src = url;
    } else {
      const templateString = this.userAutoMessageFrame(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateString, 'text/html');
      const bannerElement = doc.body.firstChild;

      // Append the content to the body
      document.body.appendChild(bannerElement);
    }
  },

  loadBanner() {
    const url = `${this.options.domain}/messenger/${this.options.app_id}/campaigns/${this.banner.id}?token=${this.token}`;

    const templateString = this.bannerFrame(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    const bannerElement = doc.body.firstChild;

    // Append the content to the body
    document.body.appendChild(bannerElement);
  },
  load: function (options) {
    this.options = options;
    this.isMobile = false;
    this.tourManager = null;
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
      /*console.log(
        'idle triggered by inactivity',
        this.tabId,
        window.localStorage.getItem('chaskiqTabId')
      );*/
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

    this.visibilityChange = getBrowserVisibilityProp();
    document.addEventListener(this.visibilityChange, onVisibilityChange, false);
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
      this.registerVisit();
    });
  },

  listenFrameEvents: function () {
    this.frameEvents = (event) => {
      switch (event.data.type) {
        case 'chaskiq:event':
          this.handleFrameEvents(event.data.data);
          break;
        case 'chaskiq:tours':
          this.handleTourEditor.bind(this)(event.data);
          break;
        case 'chaskiq:banners':
          this.receiveBanners(event.data.data);
          break;
        case 'chaskiq:connected':
          this.handleConnected();
          break;
        case 'chaskiq:user_auto_message':
          this.loadUserAutoMessages(event.data);
          break;
        case 'chaskiq:user_auto_messages':
          this.handleUserAutoMessageEvents(event.data.data);
          break;
        case 'chaskiq:user_tour_receive':
          this.loadUserTour(event.data.data);
          break;
        case 'chaskiq:messenger_close':
          this.close();
          break;
        default:
          if (event.data.tourManagerEnabled) {
            console.log('TOUR MANAGER INIT EVENT!', event);
            this.deployTourManager(() => {
              this.tourManager = new TourManager({ ...event.data, ev: event });
            });
          }
          break;
      }
    };

    console.log('LISTENING EVENTS ON FRAME EVENTS');
    window.addEventListener('message', this.frameEvents.bind(this));
  },

  deployTourManager: function (cb) {
    // Load the driver.js script and then perform actions after it's loaded
    loadScript(
      'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js'
    )
      .then(() => {
        console.log('Driver.js script loaded successfully');
        // Additional actions after the script is loaded can be placed here
        cb && cb();
      })
      .catch((error) => {
        console.error('Error loading script:', error);
      });

    // Load the driver.js CSS
    loadCSS('https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css');
  },

  handleTourEditor: function (data) {
    console.log('RECIVED EVENT FROM TOUR EDITOR, SENDING TO TOURMANAGER', data);
    this.tourManager.pushEvent(data);
  },

  deployUserTour: function (data) {
    this.deployTourManager(() => {
      this.runUserTour(data);
    });
  },

  runUserTour: function (data) {
    const steps = data.data.steps_for_driver;

    this.userTour = window.driver.js.driver({
      steps: steps,
      allowClose: true,
      onNextClick: (e, step) => {
        this.userTour.moveNext();

        this.pushEvent('messenger:track_click', {
          trackable_id: data.data.id,
        });

        if (step.popover.nextBtnText === 'Done') {
          this.pushEvent('messenger:track_tour_finished', {
            trackable_id: data.data.id,
          });
        }
      },
      onPrevClick: (e) => {
        this.userTour.movePrevious();
        this.pushEvent('messenger:track_click', {
          trackable_id: data.data.id,
        });
      },
      onCloseClick: (e) => {
        //this.userTour.moveNext();
        this.userTour.destroy();
        this.pushEvent('messenger:track_tour_skipped', {
          trackable_id: data.data.id,
        });
      },
    });

    this.userTour.drive();

    this.pushEvent('messenger:track_open', {
      trackable_id: data.data.id,
    });
  },

  handleFrameEvents: function (data) {
    console.log(data);
    switch (data.type) {
      case 'conversations:unreads':
        this.updateCounters(data.data.value);
        break;
      case 'messenger:toggle':
        this.toggle();
        break;
      case 'messenger:connected':
        this.handleConnected();
        break;
      case 'banner:click':
        this.bannerActionClick(data.url);
        break;
      case 'banner:close':
        this.closeBanner();
        break;
      case 'messenger:user_tour':
        this.deployUserTour(data);
        break;
      case 'messenger:inline_mode':
        this.setDisplayMode(data.value);
        break;
      default:
        break;
    }
  },

  setDisplayMode: function (value) {
    const el = document.getElementById('messenger-frame');
    if (value) {
      el.classList.add('display-mode-inline');
    } else {
      el.classList.remove('display-mode-inline');
    }
  },

  handleUserAutoMessageEvents: function (data) {
    switch (data.action) {
      case 'removeFrame':
        document.querySelector('#chaskiq-user-auto-messages').remove();
        break;
      case 'read':
        this.pushEvent('messenger:track_open', {
          trackable_id: data.id,
        });
        break;
      case 'dismiss':
        this.pushEvent('messenger:track_close', {
          trackable_id: data.id,
        });
        break;
      default:
        break;
    }
  },

  registerVisit() {
    const parser = new UAParser();

    const results = parser.getResult();

    const data = {
      title: document.title,
      url: document.location.href,
      browser_version: results.browser.version,
      browser_name: results.browser.name,
      os_version: results.os.version,
      os: results.os.name,
    };
    console.log('PUSH EVENT HERE', data);
    this.pushEvent('messenger:register_visit', data);
  },

  handleConnected() {
    this.registerVisit();

    if (!this.banner && !this.bannerID) {
      this.pushEvent('messenger:get_banners_for_user', {});
    }

    // will fetch banner from the server
    if (!this.banner && this.bannerID) {
      this.fetchBanner(this.bannerID);
    }
    // this.processTriggers()
  },

  updateCounters: function (count) {
    const status = document.querySelector('.prime-status');
    status.innerHTML = count;
    status.setAttribute('data-content', count);
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
    window.removeEventListener('message', this.frameEvents);
    window.removeEventListener('resize', this.updateDimensions);
    document.removeEventListener(this.visibilityChange);
    window.removeEventListener('storage', this.storageListener);
    //window.removeEventListener('popstate')
    //window.removeEventListener('locationchange')
    window.removeEventListener('message', this.frameEvents);
  },
  unloadListener: function () {
    window.addEventListener('beforeunload', this.onUnload);
    //return () => {
    //  window.removeEventListener('beforeunload', onUnload);
    //};
  },
  detectMobile: function () {
    return window.matchMedia('(min-width: 320px) and (max-width: 480px)')
      .matches;
  },

  updateDimensions: function () {
    this.isMobile = this.detectMobile();
    this.pushEvent('messenger:mobile', this.isMobile);
  },
  cleanup: function () {
    //clean all the listeners here!
    // window.removeEventListener('beforeunload', onUnload);
  },
};

class ChaskiqMessengerEncrypted {
  constructor(props) {
    this.props = props;

    window.Chaskiq.load({
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

    //messenger.render();
  }
}

window.ChaskiqMessengerEncrypted = ChaskiqMessengerEncrypted;
