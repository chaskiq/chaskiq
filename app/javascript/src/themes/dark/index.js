
import { createMuiTheme } from '@material-ui/core/styles';
import pallete from './pallete'

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
  palette: pallete,
  shape: {
    borderRadius: 3,
  },
});

theme = {
  ...theme,
  overrides: {
    MuiTypography:{
      root: {
        color: pallete.primary.white
      },
      h5: {
        [theme.breakpoints.down('sm')]: {
          fontSize: 21
        },
      }
    },
    MuiPaper: {
      root: {
        backgroundColor: pallete.primary.black,
        color: pallete.primary.white
      }
    },

    MuiListItemText: {
      color: pallete.primary.white
    },

    MuiList: {
      root: {
        backgroundColor: pallete.background.default,
      }
    },

    /*MuiListItemText: {
      root: {
        color: pallete.primary.white
      }
    },*/

    MuiDrawer: {
      paper: {
        //backgroundColor: '#18202c',
        backgroundColor: pallete.background.default,
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

    MuiTableCell: {
      root: {
        color: pallete.primary.text,
        backgroundColor: pallete.background.dark,
        borderBottomColor: pallete.background.default
      },

      body: {
        color: pallete.primary.text
      }
  
    },

    

    MuiAppBar: {
      colorDefault: {
        color: pallete.background.default,
        backgroundColor: pallete.background.dark,
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
        backgroundColor: pallete.primary.main //'#d3e8d7', //#404854',
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

export default theme