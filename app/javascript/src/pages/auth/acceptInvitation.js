import React, {useState} from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router-dom'
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import TextField from '../../components/forms/Input';
import Container from '../../components/Content';
import axios from 'axios'
import {getCurrentUser} from '../../actions/current_user'
import {successAuthentication, authenticate, signout} from '../../actions/auth'
import logo from '../../images/logo.png'
import Snackbar from '../../components/Alert'
import queryString from 'query-string'
import { Redirect } from 'react-router'

function MadeWithLove() {
  return (
    <p className="mt-3 text-base text-gray-500 text-center">
      {'Built with love by the '}
      <a color="inherit" href="https://chaskiq.io/">
        Chaskiq
      </a>
      {' team.'}
    </p>
  );
}


function AcceptInvitation(props) {
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState( queryString.parse(props.location.search) )
  const [errors, setErrors] = useState({})

  const handleSubmit = (e)=>{
    e.preventDefault()

    axios.put("/agents/invitation.json", {
      agent: {
        password: password, 
        password_confirmation: passwordConfirmation, 
        invitation_token: token.invitation_token
      }
    }).then(function (response) {
 
      props.dispatch(successAuthentication(response.data.token))
      props.dispatch(getCurrentUser())
      // use router redirect + snackbar status
      window.location = "/"

    }).catch(function (response){
      setErrors(response.response.data.errors)
    });


  }

  const errorsFor = (name ) => {
    console.log(errors)
    if (!errors[name])
      return null
    return errors[name].map((o) => o).join(", ")
  }

  return (
    <Container component="main" maxWidth="xs">
      <div>
        
        <Snackbar/>

        <img src={logo} className="mx-auto h-12 w-auto" alt="chaskiq logo"/>

          <p className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
            Set password
          </p>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form
              noValidate onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="agent[password]"
                label="Password"
                type="password"
                id="password"
                autoFocus
                error={errorsFor('password')}
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                helperText={errorsFor('password') ? 
                  <p id="component-error-text">
                  {errorsFor('password')}
                  </p> : null 
                }
              />

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="agent[password_confirmation]"
                label="Password confirmation"
                type="password"
                id="password_confirmation"
                autoComplete="current-password"
                error={errorsFor('password_confirmation')}
                value={passwordConfirmation}
                onChange={(e)=> setPasswordConfirmation(e.target.value)}
                helperText={errorsFor('password_confirmation') ? 
                            <p id="component-error-text">
                              {errorsFor('password_confirmation')}
                            </p> : null 
                        }
              />
      
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Set my password
              </Button>

            </form>
          </div>

          <MadeWithLove />

        </div>
      </div>

    </Container>
  );
}

function mapStateToProps(state) {
  const { auth, current_user } = state
  const { loading, isAuthenticated } = auth

  return {
    current_user,
    loading,
    isAuthenticated
  }
}

export default connect(mapStateToProps)(AcceptInvitation)