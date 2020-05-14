import React from 'react'
import { connect } from 'react-redux'
import AppContainer from './pages/AppContainer'
import Apps from './pages/Apps'
import Login from './pages/auth/login'
import NewApp from './pages/NewApp'
import NotFound from './pages/NotFound'
import AcceptInvitation from './pages/auth/acceptInvitation'
import { Switch, Route } from 'react-router-dom'
import ZoomImage from './components/ImageZoomOverlay'

function mapStateToProps (state) {
  const { auth, current_user } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    loading,
    isAuthenticated
  }
}

function AppRouter ({ loading, isAuthenticated, current_user }) {
  return (
    <div>

      <ZoomImage/>

      <Switch>

        <Route
          path="/agents/invitation/accept"
          render={(props) => (
            <AcceptInvitation {...props} />
          )}
        />

        { !isAuthenticated && !current_user.email &&
          <Route path="/">
            <Login />
          </Route>
        }

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
    </div>
  )
}

export default connect(mapStateToProps)(AppRouter)
