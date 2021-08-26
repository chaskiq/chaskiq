import React from 'react';

export const MessengerContext = React.createContext();
export const MessengerConsumer = MessengerContext.Consumer;

function MessengerWrapper({ children, value }) {
  return (
    <MessengerContext.Provider value={{ value }}>
      {children}
    </MessengerContext.Provider>
  );
}

export function useMessengerContext() {
  return React.useContext(MessengerContext);
}

export default MessengerWrapper;
