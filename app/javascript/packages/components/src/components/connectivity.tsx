import React, { useState, useEffect } from 'react';

function InternetConnectionChecker({ onReconnect }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [wasOffline, setwasOffline] = useState(false);

  useEffect(() => {
    function handleConnectionChange() {
      setOnline(navigator.onLine);
    }

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  useEffect(() => {
    if (!online) return;
    if (wasOffline) {
      console.log('YES IT WAS OFFLINE!');
      onReconnect && onReconnect();
    }
    setwasOffline(false);
    console.log('>>>>>> HANDLE ONLINE!');
  }, [online]);

  useEffect(() => {
    if (online) return;
    setwasOffline(true);
    console.log('>>>>>> IS OFFLINE!');
  }, [online]);

  if (online) return null;

  if (!online)
    return (
      <div className="py-2 fixed bg-red-500 w-full z-20 text-white text-xs flex items-center justify-center">
        <span>You are offline. Check your internet connection.</span>
      </div>
    );
}

export default InternetConnectionChecker;
