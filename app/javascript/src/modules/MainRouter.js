import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BrowserRouter, Route,Switch } from 'react-router-dom'
import App from './App';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ShowAppContainer from '../pages/showAppContainer';


import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import GearIcon from '@atlaskit/icon/glyph/settings';
import SearchIcon from '@atlaskit/icon/glyph/search';

export default class MainRouter extends Component {
  constructor() {
    super();
    this.defaultNavLinks = [
                              ['/', 'Home', DashboardIcon],
                              ['/settings', 'Settings', GearIcon],
                              ['/apps/koqUPJs8-l-ts_Pi0sacTw', 'My App', DashboardIcon]
                            ]
    this.state = {
      navOpenState: {
        isOpen: true,
        width: 304,
      },

      navLinks: this.defaultNavLinks

    }
    this.updateNavLinks = this.updateNavLinks.bind(this)

  }

  getChildContext () {
    return {
      navOpenState: this.state.navOpenState,
    };
  }

  onNavResize = (navOpenState) => {
    this.setState({
      navOpenState,
    });
  }

  updateNavLinks(links) {
    this.setState({
      navLinks: links
    })
  }

  render() {
    return (
      <BrowserRouter>
        
        <App
          onNavResize={this.onNavResize}
          {...this.props}
          navLinks={this.state.navLinks}>
          
          <Route exact path="/" component={HomePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/apps" render={(props)=>(
            <ShowAppContainer 
              {...props} 
              initialNavLinks={this.defaultNavLinks}
              navLinks={this.state.navLinks}
              updateNavLinks={this.updateNavLinks}
            />
          )} />
        </App>

        

      </BrowserRouter>
    );
  }
}

MainRouter.childContextTypes = {
  navOpenState: PropTypes.object,
}
