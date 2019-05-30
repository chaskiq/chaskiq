import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Hidden from '@material-ui/core/Hidden';
import Navigator from '../components/Navigator';
import Content from '../components/Content';
import Header from '../components/Header';
//import '@atlaskit/css-reset';

import { BrowserRouter, Route, Switch } from 'react-router-dom'


import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ShowAppContainer from '../pages/showAppContainer';
import AppListContainer from '../pages/appListContainer';
import NewApp from '../pages/NewApp'


class Paperbase extends React.Component {
  state = {
    mobileOpen: false,
  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
    currentApp: PropTypes.object
  };

  static propTypes = {
    navOpenState: PropTypes.object,
    onNavResize: PropTypes.func,
  };


  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes } = this.props;
    const { children } = this.props;
    const drawerWidth = 256;

    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { classes: classes }));
    
    console.log("SSSS", this.props.currentUser)

    return (
        <div className={classes.root}>
          <CssBaseline />

          {
            this.props.currentApp ?
              <nav className={classes.drawer}>
                <Hidden smUp implementation="js">
                  <Navigator
                    PaperProps={{ style: { width: drawerWidth } }}
                    variant="temporary"
                    navLinks={this.props.navLinks}
                    open={this.state.mobileOpen}
                    onClose={this.handleDrawerToggle}
                    navOpenState={this.context.navOpenState}
                    onNavResize={this.props.onNavResize}
                    currentUser={this.props.currentUser}
                    currentApp={this.props.currentApp}
                    
                  />
                </Hidden>
                <Hidden xsDown implementation="css">
                  <Navigator 
                    PaperProps={{ style: { width: drawerWidth } }}
                    navLinks={this.props.navLinks}
                    currentUser={this.props.currentUser}
                    currentApp={this.props.currentApp}
                 />
                </Hidden>
              </nav> : null
          }

          <div className={classes.appContent}>
            <Header 
              onDrawerToggle={this.handleDrawerToggle} 
              currentUser={this.props.currentUser}
            />

            {
              /*<Header onDrawerToggle={this.handleDrawerToggle} />
                <main className={classes.mainContent}>
                  <Content>{childrenWithProps}</Content>
                </main>
              */
            }

            <Switch>

              <Route exact path="/" component={HomePage} />

              <Route path="/settings" component={SettingsPage} />

              <Route exact path="/apps" render={(props) => (
                <AppListContainer
                  {...props}
                  currentUser={this.props.currentUser}
                  initialNavLinks={this.props.defaultNavLinks}
                  navLinks={this.props.navLinks}
                  updateNavLinks={this.props.updateNavLinks}
                />
              )} />

              <Route exact path={`/apps/new`}
                render={(props) => (

                  <NewApp
                    currentUser={this.props.currentUser}
                    {...props}
                  />

                )}
              />

              <Route path="/apps/:appId" render={(props) => (
                <ShowAppContainer
                  {...props}
                  classes={classes}
                  currentApp={this.props.currentApp}
                  setCurrentApp={this.props.setCurrentApp}
                  currentUser={this.props.currentUser}
                  initialNavLinks={this.props.defaultNavLinks}
                  navLinks={this.props.navLinks}
                  updateNavLinks={this.props.updateNavLinks}
                  handleDrawerToggle={this.handleDrawerToggle}
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

export default Paperbase;