
import { createMuiTheme } from '@material-ui/core/styles';
import palette from './palette'

let theme = createMuiTheme({
  typography: {
    //font-family: 'IBM Plex Sans', sans-serif;
    //font-family: 'IBM Plex Sans Condensed', sans-serif;
    fontFamily: "\"Inter\", \"Helvetica\", \"Arial\", sans-serif",

    //fontFamily: "\"Roboto Mono\", \"Helvetica\", \"Arial\", sans-serif",
    fontSize: 15,
    /*fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,*/

    h4: {
      //fontFamily: "\"IBM Plex Sans Condensed\", \"Helvetica\", \"Arial\", sans-serif",
      fontFamily: "\"Inter\", \"Helvetica\", \"Arial\", sans-serif",
      fontWeight: 'bold',
      fontSize: 30,
      letterSpacing: 0.5,
    },

    h5: {
      //fontFamily: "\"IBM Plex Sans Condensed\", \"Helvetica\", \"Arial\", sans-serif",
      fontFamily: "\"Inter\", \"Helvetica\", \"Arial\", sans-serif",
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
      root: {
        color: palette.common.white
      },
      h5: {
        [theme.breakpoints.down('sm')]: {
          fontSize: 21
        },
      }
    },
    MuiPaper: {
      root: {
        backgroundColor: palette.primary.dark,
        color: palette.common.white
      }
    },

    MuiListItemText: {
      color: palette.common.white
    },

    /*MuiList: {
      root: {
        backgroundColor: palette.background.default,
      }
    },*7

    /*MuiListItemText: {
      root: {
        color: palette.common.white
      }
    },*/

    MuiDrawer: {
      paper: {
        //backgroundColor: '#18202c',
        backgroundColor: palette.background.default,
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
        color: palette.primary.text,
        backgroundColor: palette.background.dark,
        borderBottomColor: palette.background.default
      },

      body: {
        color: palette.primary.text
      }
  
    },

    

    MuiAppBar: {
      colorDefault: {
        color: palette.background.default,
        backgroundColor: palette.background.dark,
      },
      colorPrimary: {
        //borderBottom: `1px solid ${palette.common.white}`
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