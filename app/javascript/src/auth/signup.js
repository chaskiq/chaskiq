import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

class Signup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  }

  handleSubmit() {
    const { name, email, password, passwordConfirmation } = this.state
    const fb = new FormData()
    fb.append('name', name)
    fb.append('email', email)
    fb.append('password', password)
    fb.append('password_confirmation', passwordConfirmation)
    fb.append('confirm_success_url', 'http://localhost:3000/confirm_success')
    fetch('/auth', {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: fb
    })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      console.log(document.cookie)
    })
  }

  render() {
    const { isAuthenticated } = this.props
    if (isAuthenticated) {
      return <p>authenticated!</p>
    }
    return (
      <div>
        <h2>Signup</h2>
        <p>Name: <input type="text" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} /></p>
        <p>Email: <input type="text" value={this.state.email} onChange={(e) => this.setState({ email: e.target.value })} /></p>
        <p>Password: <input type="text" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} /></p>
        <p>Password Confirmation: <input type="text" value={this.state.passwordConfirmation} onChange={(e) => this.setState({ passwordConfirmation: e.target.value })} /></p>
        <p><input type="submit" value="Signup" onClick={this.handleSubmit.bind(this)} /></p>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { auth } = state
  const { isAuthenticated } = auth
  return { isAuthenticated }
}

export default connect(mapStateToProps)(Signup)