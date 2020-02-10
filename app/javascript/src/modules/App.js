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
import NoMatch from '../pages/noMatch'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import Login from '../auth/login'
import {signout} from '../actions/auth'

import Pricing from '../pages/pricingPage'
import graphql from "../graphql/client"
import {isEmpty} from 'lodash'

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
    if(!isEmpty(this.props.current_user) && prevProps.current_user.email != this.props.current_user.email){
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

    if(!isEmpty(this.props.current_user))
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
      <React.Fragment>
        <CssBaseline />
        {
          this.props.isAuthenticated && this.props.current_user.email ?
          <div className={classes.root}>
            {
              this.props.app ?
                <React.Fragment>

                
                  <Hidden smDown implementation="css">
                      <nav className={this.props.current_section ? classes.drawer : classes.drawerMin}>
                        <Navigator 
                          visitApp={(app)=> this.visitApp(app)}
                          apps={this.state.apps}
                          mini={true}
                          toggleTheme={this.props.handleToggleTheme}
                          themeValue={this.props.theme}
                          PaperProps={{ 
                            classes: {root: classes.Navigator},
                            style: { 
                              display: 'flex',
                              flexDirection: 'row'
                            } 
                          }}
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
                        PaperProps={{ 
                          classes: {root: classes.Navigator},
                          style: { 
                            display: 'flex',
                            flexDirection: 'row',
                            //this.props.drawerWidth 
                          } 
                        }}
                        mini={true}
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
              <Hidden smUp implementation="css">
                <Header
                signout={this.handleSignout}
                visitApp={(app)=> this.visitApp(app)}
                onDrawerToggle={this.handleDrawerToggle} 
                toggleTheme={this.props.handleToggleTheme}
                themeValue={this.props.theme}
                currentUser={this.props.current_user}
                apps={this.state.apps}
                />
              </Hidden>

              <Switch>

                <Route exact path="/" component={HomePage} />

                <Route path="/settings" component={SettingsPage} />

                <Route exact path="/apps" render={(props) => (
                  <HomePage
                    {...props}
                    currentUser={this.props.current_user}
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
                  />
                )} />

                <Route path="/pricing" component={Pricing}/>


                <Route component={NoMatch} />

              </Switch>

            </div>
          </div> : <Login/>
        }
      </React.Fragment>
      
    );
  }
}

Paperbase.propTypes = {
  classes: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  const { auth , app, segment, app_users, current_user, navigation } = state
  const { loading, isAuthenticated } = auth
  const {current_section} = navigation
  return {
    segment,
    app_users,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section
  }
}

export default withRouter(connect(mapStateToProps)(Paperbase))