import React from 'react'
import { connect } from 'react-redux'
import AppContainer from './pages/AppContainer'
import Apps from './pages/Apps'
import Login from './pages/auth/login'
import NewApp from './pages/NewApp'
import NotFound from './pages/NotFound'
import UnSubscribe from './pages/UnSubscribe'
import AcceptInvitation from './pages/auth/acceptInvitation'
import BlocksPlayground from './pages/BlocksPlayground'
import { Switch, Route, withRouter } from 'react-router-dom'

import ZoomImage from '@chaskiq/components/src/components/ImageZoomOverlay' 
import LoadingView from '@chaskiq/components/src/components/loadingView' 
import Snackbar from '@chaskiq/components/src/components/Alert'

import {clearLocks} from '@chaskiq/store/src/actions/upgradePages'

function mapStateToProps(state) {
  const { auth, current_user, theme } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    loading,
    isAuthenticated,
    theme,
  }
}

function AppRouter({
  isAuthenticated,
  current_user,
  location,
  dispatch,
  theme,
}) {
  const [reload, setReload] = React.useState(false)

  React.useEffect(() => {
    I18n.locale = current_user.lang || I18n.defaultLocale
  }, [])

  React.useEffect(() => {
    if (current_user.lang) {
      if (I18n.locale === current_user.lang) return
      I18n.locale = current_user.lang
      setReload(true)
      setTimeout(() => {
        setReload(false)
      }, 400)
    }
  }, [current_user.lang])

  React.useEffect(() => {
    dispatch(clearLocks())
  }, [location.key])

  return (
    <div className={`${theme}`}>
      <ZoomImage />

      <Snackbar />

      {reload && <LoadingView />}

      {!reload && (
        <Switch>
          <Route
            path="/agents/invitation/accept"
            render={(props) => <AcceptInvitation {...props} />}
          />

          <Route
            path="/playground"
            render={(props) => <BlocksPlayground {...props} />}
          />

          <Route
            path={'/campaigns/:id/subscribers/:subscriber/delete'}
            render={(props) => <UnSubscribe {...props} />}
          ></Route>

          {!isAuthenticated && (
            <Route path="/">
              <Login />
            </Route>
          )}

          <Route path="/" exact>
            <Apps />
          </Route>

          <Route path="/apps" exact>
            <Apps />
          </Route>

          <Route path="/apps/new" exact>
            <NewApp />
          </Route>

          <Route path="/apps/:appId">
            <AppContainer />
          </Route>

          <Route path="/signup" exact>
            <Login />
          </Route>

          <Route>
            <NotFound />
          </Route>
        </Switch>
      )}
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(AppRouter))
