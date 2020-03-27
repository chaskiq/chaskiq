import React, {useState} from 'react'
import { connect } from 'react-redux'
//import { Redirect } from 'react-router-dom'
import { authenticate, signout } from '../actions/auth'

import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios'

import {getCurrentUser} from '../actions/current_user'
import {successAuthentication} from '../actions/auth'

import logo from '../images/logo'

import Snackbar from '../components/snackbar'

import queryString from 'query-string'

import { Redirect } from 'react-router'


import {
  Link as RouteLink
} from 'react-router-dom'

function MadeWithLove() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Built with love by the'}
      <Link color="inherit" href="https://chaskiq.io/">
        Chasqik
      </Link>
      {' team.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: 'transparent',
    height: '120px',
    width: '350px',
    borderRadius: '0%'
  },
  logo: {
    //height: '100%',
    width: '100%'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function AcceptInvitation(props) {
  const classes = useStyles();
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState( queryString.parse(props.location.search) )
  const [errors, setErrors] = useState({})

  const handleSubmit = (e)=>{
    e.preventDefault()

    console.log(password, password_confirmation)
    
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
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          {/*<LockOutlinedIcon />*/}
          <img className={classes.logo} src={logo}/>
        </Avatar>
        <Typography component="h1" variant="h5">
          Set password
        </Typography>

        <Snackbar/>

        <form className={classes.form} 
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
              <FormHelperText id="component-error-text">
              {errorsFor('password')}
              </FormHelperText> : null 
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
                        <FormHelperText id="component-error-text">
                          {errorsFor('password_confirmation')}
                        </FormHelperText> : null 
                    }
          />
  
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Set my password
          </Button>

        </form>
      </div>
      <Box mt={5}>
        <MadeWithLove />
      </Box>
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