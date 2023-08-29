// src/App.js
import React from 'react';

import { Router, Route } from 'react-router-dom';
import history from './history.js';

import AppRouter from './AppRoutes';
import Docs from '@chaskiq/docs/src/index'; //'./pages/docs'

import { Provider } from 'react-redux';
import store from '@chaskiq/store/src/index';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  const host: string = document
    .querySelector("meta[name='chaskiq-host']")
    .getAttribute('content');
  const chaskiqHost: string = new URL(host).hostname;

  //@ts-ignore
  const auth0Domain = document.querySelector(
    'meta[name="auth0-domain"]'
  )?.content;

  //@ts-ignore
  const auth0ClientId = document.querySelector(
    'meta[name="auth0-client-id"]'
  )?.content;

  return (
    <Provider store={store}>
      <Router history={history}>
        <Route
          render={(props) => {
            const subdomain = window.location.hostname.split('.');

            if (chaskiqHost && chaskiqHost != window.location.hostname) {
              return <Docs {...props} subdomain={subdomain[0]} />;
            }

            return (
              <ErrorBoundary variant={'very-wrong'}>
                <React.Fragment>
                  {auth0Domain && (
                    <Auth0Provider
                      domain={auth0Domain}
                      clientId={auth0ClientId}
                      redirectUri={window.location.origin}
                      audience={`https://${auth0Domain}/api/v2/`}
                      scope="profile read:current_user update:current_user_metadata offline_access"
                      useRefreshTokens={true}
                      cacheLocation="localstorage"
                    >
                      <AppRouter {...props} />
                    </Auth0Provider>
                  )}

                  {!auth0Domain && <AppRouter {...props} />}
                </React.Fragment>
              </ErrorBoundary>
            );
          }}
        />
      </Router>
    </Provider>
  );
}

export default App; // connect(mapStateToProps)(App)
