import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BrowserRouter, Route,Switch } from 'react-router-dom'
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

import Login from '../auth/login'
import SignUp from '../auth/signup'
import AcceptInvitation from '../auth/AcceptInvitation'

const defaultNavOpts = {
  isOpen: false,
  width: 304
}

let theme = createMuiTheme({
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  palette: {
    primary: {
      light: '#63ccff',
      //main: '#009be5',
      //main: '#444',
      //main: '#dc18c1',
      main: '#24862c',
      white: '#fff',
      dark: '#006db3',
    }
  },
  shape: {
    borderRadius: 3,
  },
});

theme = {
  ...theme,
  overrides: {
    MuiDrawer: {
      paper: {
        //backgroundColor: '#18202c',
        backgroundColor: '#f8f8f8',
      },
    },
    MuiButton: {
      label: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      root: {
        marginLeft: theme.spacing(1),
      },
      indicator: {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        backgroundColor: theme.palette.common.white,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        margin: '0 16px',
        minWidth: 0,
        padding: 0,
        [theme.breakpoints.up('md')]: {
          padding: 0,
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      root: {
        padding: theme.spacing(1),
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 4,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: '#d3e8d7', //#404854',
      },
    },
    MuiListItemText: {
      primary: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'inherit',
        marginRight: 0,
        '& svg': {
          fontSize: 20,
        },
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
      },
    },
  },
  props: {
    MuiTab: {
      disableRipple: true,
    },
  },
  mixins: {
    ...theme.mixins,
    toolbar: {
      minHeight: 48,
    },
  },
};

const drawerWidth = 256;

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
      //navOpenState: defaultNavOpts,
      currentApp: null,
      currentUser: {},
      //navLinks: this.defaultNavLinks
    }

  }

  componentDidMount(){
    this.getCurrentUser()
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

  setCurrentApp = (app , cb) =>{
    this.setState({
      currentApp: app
    }, ()=> {cb ? cb(app) : null} )
  }

  render() {

    return (

        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
            <BrowserRouter>
              
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
                      theme={theme}
                      {...this.props}
                      {...props}
                      >
                    </App>
                  )}>
                </Route>

              </Switch>
              
            </BrowserRouter>
          </MuiThemeProvider>
        </Provider>
      
    );
  }
}

export default withStyles(styles)(MainRouter);
