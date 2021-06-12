// src/App.js
import React from 'react'

import { BrowserRouter as Router, Route } from 'react-router-dom'
import history from './history.js'

import AppRouter from './AppRoutes'
import Docs from '@chaskiq/docs/src/index' //'./pages/docs'

import { Provider } from 'react-redux'
import store from '@chaskiq/store/src/index'
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary'

function App() {
  const host = document
    .querySelector("meta[name='chaskiq-host']")
    .getAttribute('content')
  const chaskiqHost = new URL(host).hostname

  return (
    <Provider store={store}>
      <Router history={history}>
        <Route
          render={(props) => {
            const subdomain = window.location.hostname.split('.')

            if (chaskiqHost && chaskiqHost != window.location.hostname) {
              return <Docs {...props} subdomain={subdomain[0]} />
            }

            return (
              <ErrorBoundary variant={'very-wrong'}>
                <AppRouter {...props} />
              </ErrorBoundary>
            )
          }}
        />
      </Router>
    </Provider>
  )
}

export default App // connect(mapStateToProps)(App)
