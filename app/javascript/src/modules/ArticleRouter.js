import PropTypes from 'prop-types';
import React, { Component } from 'react';
import App from './App';

import { Provider, connect } from 'react-redux'
import { compose, createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk'
import persistState from 'redux-localstorage'

import Landing from '../pages/Landing'
import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'

import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import lightGreen from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";

import auth from '../actions/auth'
import app from '../actions/app'
import segment from '../actions/segments'
import app_users from '../actions/app_users'
import app_user from '../actions/app_user'

import conversations from '../actions/conversations'
import conversation from '../actions/conversation'
import current_user from '../actions/current_user'
import status_message from '../actions/status_messages'
import current_page from '../actions/navigation'
import Docs from '../pages/docs'

const rootReducer = combineReducers({
  auth,
  app,
  segment,
  app_users,
  app_user,
  conversation,
  conversations,
  current_user,
  status_message,
  current_page
})

const middlewares = [thunkMiddleware]//, routerMiddleware(history)]

const enhancer = compose(
  applyMiddleware(...middlewares),
  persistState('auth', { key: 'AUTH' })
)

const store = createStore(rootReducer, composeWithDevTools(
  enhancer
));

window.store = store


class MainRouter extends Component {
  constructor() {
    super();
    this.state = {
      currentApp: null,
      currentUser: {},
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

  render() {

    return (

        <Provider store={store}>
          
          <Docs/>
          
        </Provider>
      
    );
  }
}

export default MainRouter;
