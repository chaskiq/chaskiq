import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BrowserRouter, Route,Switch } from 'react-router-dom'
import App from './App';

import { Provider, connect } from 'react-redux'
import store from '../store'

import Docs from '../pages/docs'
import Landing from '../pages/Landing'
import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'

import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import lightGreen from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";

import Login from '../auth/login'
import SignUp from '../auth/signup'
import AcceptInvitation from '../auth/AcceptInvitation'

import theme from '../themes/light/index'
import lighttheme from '../themes/light/index'
import darktheme from '../themes/dark/index'

import {toggleTheme} from '../actions/theme'

const drawerWidth = 262;

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    padding: '48px 36px 0',
    background: '#eaeff1',
  },
};

class MainRouter extends Component {
  constructor() {
    super();
    this.theme = store.getState().theme
    this.state = {
      currentApp: null,
      currentUser: {},
      theme: theme,
    }
    
  }

  componentDidMount(){
    //this.getCurrentUser()
  }

  getCurrentUser = ()=>{

    graphql(CURRENT_USER, {}, {
      success: (data)=>{
        this.setState({ 
          currentUser: data.userSession 
        }, () => {
        })
      },
      error: (data)=>{
        //window.location = "/users/sign_in"
        console.log("error!", data.data.errors);
      }
    })
  }

  /*setCurrentApp = (app , cb) =>{
    this.setState({
      currentApp: app
    }, ()=> {cb ? cb(app) : null} )
  }*/

  resolveTheme = ()=>{
    return this.state.theme === "light" ? lighttheme : darktheme
  }

  handleToggleTheme = ()=>{
    const storeTheme = store.getState().theme
    const siteTheme = storeTheme === "dark" ? 'light' : 'dark' 
    
    this.setState({
      theme: siteTheme
    }, ()=> {
      store.dispatch(toggleTheme(siteTheme))
    })
  }

  

  render() {
    return (

        <Provider store={store}>
          <MuiThemeProvider theme={this.resolveTheme()}>
            <BrowserRouter>
            
                <Route
                  render={props => { 
                    const subdomain = window.location.hostname.split('.')
                    const appDomains = ["chaskiq", "www", "admin"].filter((o)=> o === subdomain[0])
                     
                    if (subdomain && subdomain.length > 1 && appDomains.length === 0) 
                      return <Docs {...this.props} {...props} subdomain={subdomain[0]}/>
                     
                    return <AppLayout 
                              theme={this.state.theme}
                              handleToggleTheme={this.handleToggleTheme}
                              {...this.props} 
                              {...props}
                            />
                  }
                }/> 
              
            </BrowserRouter>
          </MuiThemeProvider>
        </Provider>
      
    );
  }
}

class AppLayout extends React.Component{

  render(){
    return (
      <Switch>
        <Route exact 
          path="/signup" 
          component={SignUp} 
        />

        <Route path="/agents/invitation/accept" 
              render={(props)=>(
                <AcceptInvitation {...props} {...this.props}/>
              )}
        />
        

        <Route render={(props)=>(
            <App
              {...this.props}
              {...props}
              drawerWidth={drawerWidth}
              >
            </App>
          )}>
        </Route>

      </Switch>

    )
  }
  
}

export default withStyles(styles)(MainRouter);
