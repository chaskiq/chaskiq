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


let theme = createMuiTheme({

  typography: {
    //font-family: 'IBM Plex Sans', sans-serif;
    //font-family: 'IBM Plex Sans Condensed', sans-serif;
    //fontFamily: "\"IBM Plex Sans\", \"Helvetica\", \"Arial\", sans-serif",

    fontFamily: "\"Roboto Mono\", \"Helvetica\", \"Arial\", sans-serif",
    fontSize: 14,
    /*fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,*/

    h4: {
      //fontFamily: "\"IBM Plex Sans Condensed\", \"Helvetica\", \"Arial\", sans-serif",
      fontFamily: "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
      fontWeight: 'bold',
      fontSize: 30,
      letterSpacing: 0.5,
    },

    h5: {
      //fontFamily: "\"IBM Plex Sans Condensed\", \"Helvetica\", \"Arial\", sans-serif",
      fontFamily: "\"Open Sans\", \"Helvetica\", \"Arial\", sans-serif",
      fontWeight: 'bold',
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
      main: '#0000ff', // '#24862c',
      white: '#fff',
      dark: '#0d0392', //'#15501a', //'#006db3',
    },
   error: {
    light: "#e57373",
    main: "#f44336",
    dark: "#d32f2f",
    contrastText: "#fff",
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

  /*setCurrentApp = (app , cb) =>{
    this.setState({
      currentApp: app
    }, ()=> {cb ? cb(app) : null} )
  }*/

  render() {

    return (

        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
            <BrowserRouter>
            
                <Route
                  render={props => { 
                    const subdomain = window.location.hostname.split('.')
                    const appDomains = ["chaskiq", "www", "admin"].filter((o)=> o === subdomain[0])
                     
                    if (subdomain && subdomain.length > 1 && appDomains.length === 0) 
                      return <Docs {...this.props} {...props} subdomain={subdomain[0]}/>
                     
                    return <AppLayout {...this.props} {...props}/>
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
              theme={theme}
              {...this.props}
              {...props}
              >
            </App>
          )}>
        </Route>

      </Switch>

    )
  }
  
}

export default withStyles(styles)(MainRouter);
