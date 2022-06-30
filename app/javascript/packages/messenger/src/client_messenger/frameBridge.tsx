// frame internals grab
import React, { Component } from 'react';
import useAutoLogout from '@chaskiq/components/src/components/hooks/useAutoLogout';

export default function FrameBridge(props) {
  // console.log(props)
  const idleSessionTime =
    props?.inboundSettings?.visitors?.idle_sessions_after || 5;
  const timeoutLapse = idleSessionTime * 60;
  // this will create events on the window and on the frame window
  const timer = useAutoLogout(timeoutLapse, props.window);
  const isVisible = usePageVisibility();

  useUnload((e) => {
    // e.preventDefault();
    window.localStorage.removeItem('chaskiqTabId');
  });

  React.useEffect(() => {
    function listenForStorage(event) {
      if (event.storageArea != window.localStorage) return;
      if (event.key === 'chaskiqTabClosedAt') {
        props.closeMessenger();
      }
    }

    window.addEventListener('storage', listenForStorage);
    return () => {
      window.removeEventListener('storage', listenForStorage);
    };
  }, []);

  React.useEffect(() => {
    if (props.kind !== 'Visitor') return;
    if (!props?.inboundSettings?.visitors?.idle_sessions_enabled) return;

    if (timer == 0) {
      console.log('idle triggered');
      props.setTimer && props.setTimer(timer, props.tabId);
      window.localStorage.setItem('chaskiqTabId', props.tabId);
    }
  }, [timer]);

  React.useEffect(() => {
    props.window.addEventListener(
      'message',
      (e) => {
        if (!e.data.chaskiqMessage) return;
        props.handleAppPackageEvent(e);
      },
      false
    );
  }, []);

  // visibility, active tab will set the current item
  React.useEffect(() => {
    if (isVisible) {
      if (window.localStorage.getItem('chaskiqTabId') != props.tabId) {
        window.localStorage.setItem('chaskiqTabId', props.tabId);
      }
    }
  }, [isVisible]);

  const children = React.Children.map(props.children, (child, _index) => {
    //@ts-ignore
    return React.cloneElement(child, {
      //@ts-ignore
      window: props.window,
      //@ts-ignore
      document: props.document,
    });
  });

  return <React.Fragment>{children}</React.Fragment>;
}

const useUnload = (fn) => {
  const cb = React.useRef(fn);

  React.useEffect(() => {
    const onUnload = cb.current;
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [cb]);
};

function usePageVisibility() {
  const [isVisible, setIsVisible] = React.useState(getIsDocumentHidden());
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden());

  React.useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp();

    document.addEventListener(visibilityChange, onVisibilityChange, false);

    return () => {
      document.removeEventListener(visibilityChange, onVisibilityChange);
    };
  });

  return isVisible;
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
