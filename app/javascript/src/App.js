// src/App.js
import React from 'react'

import { BrowserRouter as Router, Route } from 'react-router-dom'
import history from './history.js'

/* import Docs from '../pages/docs'
import Landing from '../pages/Landing' */

/* import Login from '../auth/login'
import SignUp from '../auth/signup'
import AcceptInvitation from '../auth/AcceptInvitation' */

import AppRouter from './AppRoutes'

import { toggleTheme } from './actions/theme'

import Snackbar from './components/Alert'
import Docs from './pages/docs'

import { Provider } from 'react-redux'
import store from './store'
import ErrorBoundary from './components/ErrorBoundary'

const lighttheme = 1
const darktheme = 1

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      theme: store.getState().theme
    }

    // console.log(process.env.HOST)
    const host = document
      .querySelector("meta[name='chaskiq-host']")
      .getAttribute('content')
    this.chaskiqHost = new URL(host).hostname
  }

    resolveTheme = () => {
      return this.state.theme === 'light' ? lighttheme : darktheme
    }

    handleToggleTheme = () => {
      const storeTheme = store.getState().theme
      const siteTheme = storeTheme === 'dark' ? 'light' : 'dark'
      this.setState(
        {
          theme: siteTheme
        },
        () => {
          store.dispatch(toggleTheme(siteTheme))
        }
      )
    }

    render () {
      return (
        <Provider store={store}>
          <Snackbar />

          <Router history={history}>
            <Route
              render={(props) => {
                const subdomain = window.location.hostname.split(
                  '.'
                )
                /* console.log(
                                this.chaskiqHost,
                                window.location.hostname
                            ) */
                if (
                  this.chaskiqHost &&
                                this.chaskiqHost != window.location.hostname
                ) {
                  return (
                    <Docs
                      {...this.props}
                      {...props}
                      subdomain={subdomain[0]}
                    />
                  )
                }

                return (
                  <ErrorBoundary variant={'very-wrong'}>
                    <AppRouter
                      themeData={this.resolveTheme()}
                      theme={this.state.theme}
                      handleToggleTheme={this.handleToggleTheme}
                      {...this.props}
                      {...props}
                    />
                  </ErrorBoundary>
                )
              }}
            />
          </Router>
        </Provider>
      )
    }
}

export default App // connect(mapStateToProps)(App)
