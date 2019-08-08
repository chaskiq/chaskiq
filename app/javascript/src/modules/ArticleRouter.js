import PropTypes from 'prop-types';
import React, { Component } from 'react';
import App from './App';

import { Provider, connect } from 'react-redux'

import Landing from '../pages/Landing'
import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'
import Docs from '../pages/docs'
import store from '../store'

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
