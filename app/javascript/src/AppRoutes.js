import React from 'react'
import { connect } from 'react-redux'
import AppContainer from './pages/AppContainer'
import Apps from './pages/Apps'
import Login from './pages/auth/login'
import NewApp from './pages/NewApp'
import NotFound from './pages/NotFound'
import UnSubscribe from './pages/UnSubscribe'
import AcceptInvitation from './pages/auth/acceptInvitation'
import { Switch, Route } from 'react-router-dom'
import ZoomImage from './components/ImageZoomOverlay'
import LoadingView from './components/loadingView'

function mapStateToProps (state) {
  const { auth, current_user } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    loading,
    isAuthenticated
  }
}

function AppRouter ({
  loading,
  isAuthenticated,
  current_user,
}) {

  const [reload, setReload] = React.useState(false)

  React.useEffect(() => {
    I18n.locale = current_user.lang || I18n.defaultLocale
  }, [])

  React.useEffect(() => {
    if(!current_user.lang)
      return

    I18n.locale = current_user.lang
    setReload(true)
    setTimeout(() => {
      setReload(false)
    }, 400);
  }, [current_user.lang])

  return (
    <div>

      <ZoomImage/>

      {
        reload && <LoadingView/>
      }

      {
        !reload && <Switch>

          <Route
            path="/agents/invitation/accept"
            render={(props) => (
              <AcceptInvitation {...props} />
            )}
          />

          <Route
            path={'/campaigns/:id/subscribers/:subscriber/delete'}
            render={(props) => (
              <UnSubscribe {...props} />
            )}>
          </Route>

          { !isAuthenticated &&
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
      }

    </div>
  )
}

export default connect(mapStateToProps)(AppRouter)
