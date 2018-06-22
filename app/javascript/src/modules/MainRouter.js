import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BrowserRouter, Route,Switch } from 'react-router-dom'
import App from './App';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ShowAppContainer from '../pages/showAppContainer';
import AppListContainer from '../pages/appListContainer';
import axios from 'axios'

import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import GearIcon from '@atlaskit/icon/glyph/settings';
import SearchIcon from '@atlaskit/icon/glyph/search';

export default class MainRouter extends Component {
  constructor() {
    super();
    this.defaultNavLinks = [
                              ['/', 'Home', DashboardIcon],
                              ['/settings', 'Settings', GearIcon],
                              ['/apps', 'My Apps', DashboardIcon],
                            ]
    this.state = {
      navOpenState: {
        isOpen: true,
        width: 304
      },

      currentUser: {},

      navLinks: this.defaultNavLinks

    }
    this.updateNavLinks = this.updateNavLinks.bind(this)

  }

  componentDidMount(){
    this.getCurrentUser()
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

  getCurrentUser = ()=>{
    axios.get(`/user_session.json`)
    .then( (response)=> {
      this.setState({currentUser: response.data.current_user }, ()=>{ 
        
      })
    })
    .catch( (error)=> {
      console.log(error);
    });

  }

  render() {
    // console.log(this.state.currentUser)
    return (
      <BrowserRouter>

        {
          this.state.currentUser.email ?
            <App
              onNavResize={this.onNavResize}
              {...this.props}
              currentUser={this.state.currentUser}
              navLinks={this.state.navLinks}>
              
              <Route exact path="/" component={HomePage} />
              <Route path="/settings" component={SettingsPage} />

              <Route exact path="/apps" render={(props)=>(
                <AppListContainer
                  {...props} 
                  currentUser={this.state.currentUser}
                  initialNavLinks={this.defaultNavLinks}
                  navLinks={this.state.navLinks}
                  updateNavLinks={this.updateNavLinks}
                />
              )} />  

              <Route path="/apps/:appId" render={(props)=>(
                <ShowAppContainer 
                  {...props} 
                  currentUser={this.state.currentUser}
                  initialNavLinks={this.defaultNavLinks}
                  navLinks={this.state.navLinks}
                  updateNavLinks={this.updateNavLinks}
                />
              )} />
            </App> : <p>no logged user</p>
        }

      </BrowserRouter>
    );
  }
}

MainRouter.childContextTypes = {
  navOpenState: PropTypes.object,
}
