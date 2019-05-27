import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BrowserRouter, Route,Switch } from 'react-router-dom'
import App from './App';

import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import GearIcon from '@atlaskit/icon/glyph/settings';
import SearchIcon from '@atlaskit/icon/glyph/search';
import Landing from '../pages/Landing'
import graphql from '../graphql/client'
import {CURRENT_USER} from '../graphql/queries'

import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import lightGreen from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";

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


class MainRouter extends Component {
  constructor() {
    super();
    this.defaultNavLinks = [
                              {url: '/',  name:'Home', icon: DashboardIcon},
                              {url: '/settings',  name:'Settings', icon: GearIcon},
                              {url: '/apps', name: 'My Apps', icon: DashboardIcon},
                            ]
    this.state = {
      navOpenState: defaultNavOpts,
      currentApp: null,
      currentUser: {},
      navLinks: this.defaultNavLinks
    }

  }

  componentDidMount(){
    this.getCurrentUser()
  }

  getChildContext () {
    return {
      navOpenState: this.state.navOpenState,
    };
  }

  onNavResize = (navOpenState) => {
    this.setState({
      navOpenState,
    });
  }

  updateNavLinks =(links)=> {
    this.setState({
      navLinks: links
    })
  }

  getCurrentUser = ()=>{

    graphql(CURRENT_USER, {}, {
      success: (data)=>{
        this.setState({ currentUser: data.userSession }, () => {
        })
      },
      error: (error)=>{
        console.log(error);
    
      }
    })

    /*

    axios.get(`/user_session.json`)
    .then( (response)=> {
      this.setState({currentUser: response.data.current_user }, ()=>{   
      })
    })
    .catch( (error)=> {
      console.log(error);
    });
    */
  }

  setCurrentApp = (app , cb) =>{
    this.setState({
      currentApp: app, 
      navOpenState: {
        isOpen: true,
        width: 304
      } 
    }, ()=> {cb ? cb(app) : null} )
  }


  render() {

    return (
      <BrowserRouter>
        
        <MuiThemeProvider theme={theme}>
          <React.Fragment>
        {
          this.state.currentUser.email ?
            <App
              theme={theme}
              onNavResize={this.onNavResize}
              navOpenState={this.navOpenState}
              updateNavLinks={this.updateNavLinks}
              currentUser={this.state.currentUser}
              currentApp={this.state.currentApp}
              navLinks={this.state.navLinks}
              setCurrentApp={this.setCurrentApp}
              {...this.props}
              >
 
            </App> : <Landing/>
        }
          </React.Fragment>
        </MuiThemeProvider>
      
      </BrowserRouter>
    );
  }
}

MainRouter.childContextTypes = {
  navOpenState: PropTypes.object,
}

export default withStyles(styles)(MainRouter);
