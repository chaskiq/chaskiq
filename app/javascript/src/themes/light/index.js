
import { createMuiTheme } from '@material-ui/core/styles';
import palette from './palette'

let theme = createMuiTheme({
  typography: {
    //font-family: 'IBM Plex Sans', sans-serif;
    //font-family: 'IBM Plex Sans Condensed', sans-serif;
    fontFamily: "\"IBM Plex Sans\", \"Helvetica\", \"Arial\", sans-serif",

    //fontFamily: "\"Roboto Mono\", \"Helvetica\", \"Arial\", sans-serif",
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
  palette: palette,
  shape: {
    borderRadius: 3,
  },
});

theme = {
  ...theme,
  overrides: {
    MuiTypography:{
      h5: {
        [theme.breakpoints.down('sm')]: {
          fontSize: 21
        },
      }
    },
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
    MuiBadge: {
      colorPrimary: {
        backgroundColor: "#10e810"
      }
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
        backgroundColor: theme.palette.primary.borders //'#d3e8d7', //#404854',
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
    MuiExpansionPanel: {
      rounded: {
        color: theme.palette.common.gray,
      }
    }
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

export default theme