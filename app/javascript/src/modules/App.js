import React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import Hidden from '@material-ui/core/Hidden';
import Navigator from '../components/Navigator';
import Header from '../components/Header';

import { Route, Switch } from 'react-router-dom'


import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ShowAppContainer from '../pages/showAppContainer';
import AppListContainer from '../pages/appListContainer';
import NewApp from '../pages/NewApp';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import Login from '../auth/login'
import {signout} from '../actions/auth'

import Pricing from '../pages/pricingPage'
import graphql from "../graphql/client"

import { APPS } from "../graphql/queries"


class Paperbase extends React.Component {
  state = {
    mobileOpen: false,
    apps: []
  };

  static contextTypes = {
    router: PropTypes.object,
    currentApp: PropTypes.object,
  };

  componentDidUpdate(prevProps){
    if(prevProps.current_user.email != this.props.current_user.email){
      this.fetchApps()
    }

    if(this.props.location.key !== prevProps.location.key){
      this.setState({ mobileOpen: false });
    }
  }

  idleLogout = ()=> {
    var time;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function logout() {
      //alert("You are now logged out.")
      location.href = '/'
    }

    function resetTimer() {
      clearTimeout(time);
      time = setTimeout(logout, 1800000) // 30 minutes
      // 1000 milliseconds = 1 second
    }
  };


  componentDidMount(){
    this.fetchApps()
  }

  fetchApps = ()=>{
    graphql(APPS ,{} ,{
      success: (data)=>{
        this.setState({apps: data.apps})
      }, 
      error: (error)=>{

      }
    })
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  handleSignout = ()=>{
    this.props.dispatch(signout())
  }

  visitApp = (app)=>{
    const url = `/apps/${app.key}`
    this.props.history.push(url)
  }



  render() {
    const { classes } = this.props;
    const { children } = this.props;
    
    return (
        this.props.isAuthenticated && this.props.current_user.email ?
        <div className={classes.root}>
          <CssBaseline />

          {
            this.props.app ?
              <React.Fragment>

              
                <Hidden smDown implementation="css">
                    <nav className={classes.drawer}>
                      <Navigator 
                        visitApp={(app)=> this.visitApp(app)}
                        apps={this.state.apps}
                        PaperProps={{ style: { width: this.props.drawerWidth } }}
                        variant="permanent"
                        open={true}
                        //onClose={this.handleDrawerToggle}
                        //currentUser={this.props.current_user}
                        //app={this.props.app}
                    />
                  </nav>
                </Hidden>
              

                <Hidden smUp implementation="css">
                  <nav className={classes.drawer}>
                    <Navigator
                      visitApp={(app)=> this.visitApp(app)}
                      apps={this.state.apps}
                      PaperProps={{ style: { width: this.props.drawerWidth } }}
                      variant="temporary"
                      open={this.state.mobileOpen}
                      onClose={this.handleDrawerToggle}

                      //currentUser={this.props.current_user}
                      //app={this.props.app}
                    />
                  </nav>
                </Hidden>
               


             

              </React.Fragment> : null
          }

          <div className={classes.appContent}>
            {/* TODO: use currentPage or other redux attr to skip header on specific pages */}
            <Header
              signout={this.handleSignout}
              visitApp={(app)=> this.visitApp(app)}
              onDrawerToggle={this.handleDrawerToggle} 
              toggleTheme={this.props.handleToggleTheme}
              themeValue={this.props.theme}
              currentUser={this.props.current_user}
              apps={this.state.apps}
            />

            <Switch>

              <Route exact path="/" component={HomePage} />

              <Route path="/settings" component={SettingsPage} />

              <Route exact path="/apps" render={(props) => (
                <AppListContainer
                  {...props}
                  currentUser={this.props.current_user}
                  //initialNavLinks={this.props.defaultNavLinks}
                  //navLinks={this.props.navLinks}
                  //updateNavLinks={this.props.updateNavLinks}
                />
              )} />

              <Route exact path={`/apps/new`}
                render={(props) => (

                   
                
                    <NewApp
                      history={this.props.history}
                      currentUser={this.props.current_user}
                      {...props}
                    />
                  

                )}
              />

              <Route path="/apps/:appId" render={(props) => (
                <ShowAppContainer
                  {...props}
                  classes={classes}

                  //currentApp={this.props.currentApp}
                  //setCurrentApp={this.props.setCurrentApp}
                  //setCurrentApp={setApp}
                  //app={this.props.app}
                  //segment={this.props.segment}
                  //app_users={this.props.app_users}
                  //currentUser={this.props.current_user}
                  //dispatch={this.props.dispatch}
                  //initialNavLinks={this.props.defaultNavLinks}
                  //navLinks={this.props.navLinks}
                  //updateNavLinks={this.props.updateNavLinks}
                  //handleDrawerToggle={this.handleDrawerToggle}
                />
              )} />

              <Route path="/pricing" component={Pricing}/>

            </Switch>

          </div>

        </div> : <Login/>
      
    );
  }
}

Paperbase.propTypes = {
  classes: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  const { auth , app, segment, app_users, current_user } = state
  const { loading, isAuthenticated } = auth
  return {
    segment,
    app_users,
    current_user,
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Paperbase))