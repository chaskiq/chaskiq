import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Hidden from '@material-ui/core/Hidden';
import Navigator from '../components/Navigator';
import Content from '../components/Content';
import Header from '../components/Header';

import { Route, Switch } from 'react-router-dom'


import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ShowAppContainer from '../pages/showAppContainer';
import AppListContainer from '../pages/appListContainer';
//import NewApp from '../pages/NewApp'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { setApp } from '../actions/app'

class Paperbase extends React.Component {
  state = {
    mobileOpen: false,
  };

  static contextTypes = {
    router: PropTypes.object,
    currentApp: PropTypes.object
  };

  /*static propTypes = {
    onNavResize: PropTypes.func,
  };*/


  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes } = this.props;
    const { children } = this.props;
    const drawerWidth = 256;
    return (
        <div className={classes.root}>
          <CssBaseline />

          {
            this.props.app ?
              <nav className={classes.drawer}>
                <Hidden smUp implementation="js">
                  <Navigator
                    PaperProps={{ style: { width: drawerWidth } }}
                    variant="temporary"
                    open={this.state.mobileOpen}
                    onClose={this.handleDrawerToggle}
                    currentUser={this.props.currentUser}
                    app={this.props.app}
                    
                  />
                </Hidden>
                <Hidden xsDown implementation="css">
                  <Navigator 
                    PaperProps={{ style: { width: drawerWidth } }}
                    currentUser={this.props.currentUser}
                    app={this.props.app}
                 />
                </Hidden>
              </nav> : null
          }

          <div className={classes.appContent}>
            <Header 
              onDrawerToggle={this.handleDrawerToggle} 
              currentUser={this.props.currentUser}
            />

            <Switch>

              <Route exact path="/" component={HomePage} />

              <Route path="/settings" component={SettingsPage} />

              <Route exact path="/apps" render={(props) => (
                <AppListContainer
                  {...props}
                  currentUser={this.props.currentUser}
                  //initialNavLinks={this.props.defaultNavLinks}
                  //navLinks={this.props.navLinks}
                  //updateNavLinks={this.props.updateNavLinks}
                />
              )} />

              <Route exact path={`/apps/new`}
                render={(props) => (

                   
                  <p>
                  new app ere
                    {/*<NewApp
                      currentUser={this.props.currentUser}
                      {...props}
                    />*/}

                  </p>
                  

                )}
              />

              <Route path="/apps/:appId" render={(props) => (
                <ShowAppContainer
                  {...props}
                  classes={classes}
                  //currentApp={this.props.currentApp}
                  //setCurrentApp={this.props.setCurrentApp}
                  //setCurrentApp={setApp}
                  currentUser={this.props.currentUser}
                  //initialNavLinks={this.props.defaultNavLinks}
                  //navLinks={this.props.navLinks}
                  //updateNavLinks={this.props.updateNavLinks}
                  //handleDrawerToggle={this.handleDrawerToggle}
                />
              )} />

            </Switch>

          </div>

        </div>
      
    );
  }
}

Paperbase.propTypes = {
  classes: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  const { auth , app } = state
  const { loading, isAuthenticated } = auth
  return {
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Paperbase))

//export default connect(mapStateToProps)(Paperbase)
//export default Paperbase;