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
import { ThemeProvider } from 'emotion-theming'

import lightGreen from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";

import Login from '../auth/login'
import SignUp from '../auth/signup'
import AcceptInvitation from '../auth/AcceptInvitation'

import theme from '../themes/light/index'
import lighttheme from '../themes/light/index'
import darktheme from '../themes/dark/index'

import {toggleTheme} from '../actions/theme'

//const drawerWidth = 70;

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: '300px',
      flexShrink: 0,
    },
  },
  drawerMin: {
    [theme.breakpoints.up('sm')]: {
      width: '50px',
      flexShrink: 0,
    },
  },
  Navigator: {
    color: theme.palette.sidebar.color,
    background: theme.palette.sidebar.background,
    border: theme.palette.sidebar.borders
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
    this.state = {
      currentApp: null,
      currentUser: {},
      theme: store.getState().theme,
    }

    //console.log(process.env.HOST)
    const host = document.querySelector("meta[name='chaskiq-host']").getAttribute('content')
    this.chaskiqHost = new URL(host).host
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
                    console.log(this.chaskiqHost.hostname , window.location.hostname)
                    if( this.chaskiqHost != window.location.host)
                      return <Docs {...this.props} {...props} subdomain={subdomain[0]}/>
                     
                    return <AppLayout 
                              themeData={this.resolveTheme()}
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
      <ThemeProvider theme={this.props.themeData}>
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
                //drawerWidth={drawerWidth}
                >
              </App>
            )}>
          </Route>

        </Switch>
      </ThemeProvider>
    )
  }
  
}

export default withStyles(styles)(MainRouter);
