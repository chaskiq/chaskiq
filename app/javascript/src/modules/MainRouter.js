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
import Landing from '../pages/Landing'
import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'

import NewApp from '../pages/NewApp'

const defaultNavOpts = {
  isOpen: false,
  width: 304
}

export default class MainRouter extends Component {
  constructor() {
    super();
    this.defaultNavLinks = [
                              ['/', 'Home', DashboardIcon],
                              ['/settings', 'Settings', GearIcon],
                              ['/apps', 'My Apps', DashboardIcon],
                            ]
    this.state = {
      navOpenState: defaultNavOpts,
      currentApp: null,
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

    graphql(CURRENT_USER, {}, {
      success: (data)=>{
        this.setState({ currentUser: data.userSession }, () => {
        })
      },
      error: (error)=>{
        console.log(error);
    
      }
    })

    /*

    axios.get(`/user_session.json`)
    .then( (response)=> {
      this.setState({currentUser: response.data.current_user }, ()=>{   
      })
    })
    .catch( (error)=> {
      console.log(error);
    });
    */
  }

  setCurrentApp = (app , cb) =>{
    this.setState({
      currentApp: app, 
      navOpenState: {
        isOpen: true,
        width: 304
      } 
    }, ()=> {cb ? cb(app) : null} )
  }

  render() {
    return (
      <BrowserRouter>

        {
          this.state.currentUser.email ?
            <App
              onNavResize={this.onNavResize}
              navOpenState={this.navOpenState}
              currentUser={this.state.currentUser}
              currentApp={this.state.currentApp}
              navLinks={this.state.navLinks}
              setCurrentApp={this.setCurrentApp}
              {...this.props}
              >

              <Switch>

                <Route exact path="/" component={HomePage} />

                <Route path="/settings" component={SettingsPage} />

                <Route exact path="/apps" render={(props) => (
                  <AppListContainer
                    {...props}
                    currentUser={this.state.currentUser}
                    initialNavLinks={this.defaultNavLinks}
                    navLinks={this.state.navLinks}
                    updateNavLinks={this.updateNavLinks}
                  />
                )} />

                <Route exact path={`/apps/new`}
                  render={(props) => (

                    <NewApp
                      currentUser={this.state.currentUser}
                      {...props}
                    />

                  )}
                />

                <Route path="/apps/:appId" render={(props) => (
                  <ShowAppContainer
                    {...props}
                    currentApp={this.state.currentApp}
                    setCurrentApp={this.setCurrentApp}
                    currentUser={this.state.currentUser}
                    initialNavLinks={this.defaultNavLinks}
                    navLinks={this.state.navLinks}
                    updateNavLinks={this.updateNavLinks}
                  />
                )} />

              </Switch>
              
            </App> : <Landing/>
        }

      </BrowserRouter>
    );
  }
}

MainRouter.childContextTypes = {
  navOpenState: PropTypes.object,
}
