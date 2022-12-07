// frame internals grab
import React from 'react';
import useAutoLogout from '@chaskiq/components/src/components/hooks/useAutoLogout';
import { getDiff, setLastActivity } from './activityUtils';

export default function FrameBridge(props) {
  // console.log(props)
  const idleSessionTime =
    props?.inboundSettings?.visitors?.idle_sessions_after || 5;
  const timeoutLapse = idleSessionTime * 60;
  // this will create events on the window and on the frame window
  const timer = useAutoLogout(timeoutLapse, props.window);

  useUnload((e) => {
    // e.preventDefault();
    window.localStorage.removeItem('chaskiqTabId');
  });

  React.useEffect(() => {
    // we'll asume that opening this will set current tab
    // window.localStorage.setItem('chaskiqTabId', props.tabId);
    setLastActivity();
  }, []);

  React.useEffect(() => {
    if (!['Visitor', 'Lead'].includes(props.kind)) return;
    if (!props?.inboundSettings?.visitors?.idle_sessions_enabled) return;
    // console.log(timer)

    if (getDiff() >= timeoutLapse) {
      // console.log('idle triggered by inactivity', props.tabId, window.localStorage.getItem('chaskiqTabId'));
      props.setTimer && props.setTimer(timer, props.tabId);
    }

    if (timer == timeoutLapse) {
      setLastActivity();
    }

    if (timer == 0) {
      // console.log('idle triggered on tab', props.tabId, window.localStorage.getItem('chaskiqTabId'));
      props.setTimer && props.setTimer(timer, props.tabId);
      // window.localStorage.setItem('chaskiqTabId', props.tabId);
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
