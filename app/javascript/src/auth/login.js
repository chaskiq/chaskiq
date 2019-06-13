import React from 'react'
import { connect } from 'react-redux'
//import { Redirect } from 'react-router-dom'
import { authenticate, signout } from '../actions/auth'

import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'


class Login extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      email: '',
      password: ''
    }
  }

  handleSubmit() {
    const { email, password } = this.state
    this.props.dispatch(authenticate(email, password))
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
    const { isAuthenticated } = this.props
    if (isAuthenticated) {
      return <p>lofgged! 
        <button onClick={()=>{
          this.props.dispatch(signout())
        }}>sign out</button>

        <button onClick={this.getCurrentUser}>
          getUserData
        </button>
      </p>
    }
    return (
      <div>
        <h2>Login</h2>
        <p>Email: <input type="text" value={this.state.email} onChange={(e) => this.setState({ email: e.target.value })} /></p>
        <p>Password: <input type="text" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} /></p>
        <p><input type="submit" value="Login" onClick={this.handleSubmit.bind(this)} /></p>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { auth } = state
  const { loading, isAuthenticated } = auth

  return {
    loading,
    isAuthenticated
  }
}

export default connect(mapStateToProps)(Login)