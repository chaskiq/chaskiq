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
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import {getCurrentUser} from '../actions/current_user'

import logo from '../images/logo'

import Snackbar from '../components/snackbar'

import { MuiThemeProvider } from '@material-ui/core/styles';

import lightTheme from '../themes/light/index'
import darkTheme from '../themes/dark/index'

import LoadingView from '../components/loadingView'



class Login extends React.Component {
  constructor(props) {
    super(props)
  }

  handleSubmit(data) {
    const { email, password } = data //this.state
    this.props.dispatch(authenticate(email, password, ()=>{
      this.getCurrentUser()
    }))
  }

  getCurrentUser = ()=>{
    this.props.dispatch(getCurrentUser())
  }

  render() {
    const { isAuthenticated } = this.props
    if (isAuthenticated) {
      return <GetUserDataButton onClick={this.getCurrentUser}/>
    }
    return (
      <div>
        <SignIn 
          {...this.props}
          handleSubmit={this.handleSubmit.bind(this)}
        />
      </div>
    )
  }
}

function GetUserDataButton(props){
  props.onClick()
  return <LoadingView onClick={props.onClick}/>
}

function MadeWithLove() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Built with love by the '}
      <Link color="inherit" href="https://chaskiq.io/">
        Chasqik Team
      </Link>
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.background.default,
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: 'transparent',
    width: '348px',
    height: '96px',
    borderRadius: '0%'
  },
  logo: {
    height: '100%',
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

function SignIn(props) {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e)=>{
    e.preventDefault()
    props.handleSubmit({email, password})
  }

  const theme = props.theme === "light" ? lightTheme : darkTheme

  return (
    <MuiThemeProvider theme={theme}>
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          {/*<LockOutlinedIcon />*/}
          <img className={classes.logo} src={logo}/>
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <Snackbar/>

        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e)=> setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>

          <Grid container>
            
            <Grid item xs>
              <Link href="/forgot" variant="body2">
                Forgot password?
              </Link>
            </Grid>

            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>

        </form>
      </Paper>
      <Box mt={5}>
        <MadeWithLove />
      </Box>
    </Container>
    </MuiThemeProvider>
  );
}




function mapStateToProps(state) {
  const { auth, current_user, theme } = state
  const { loading, isAuthenticated } = auth

  return {
    current_user,
    loading,
    isAuthenticated,
    theme
  }
}

export default connect(mapStateToProps)(Login)