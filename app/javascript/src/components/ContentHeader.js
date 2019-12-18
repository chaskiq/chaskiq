import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs'

const lightColor = 'rgba(255, 255, 255, 0.7)';

const styles = theme => ({
  secondaryBar: {
    zIndex: 0,
    [theme.breakpoints.up('sm')]: {},
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
    },
  },
  menuButton: {
    marginLeft: -theme.spacing(1),
  },
  iconButtonAvatar: {
    padding: 4,
  },
  link: {
    textDecoration: 'none',
    color: lightColor,
    '&:hover': {
      color: theme.palette.common.white,
    },
  },
  button: {
    //borderColor: lightColor,
  },
});

function ContentHeader(props) {
  const { classes, onDrawerToggle, items } = props;

  return (
    <React.Fragment>

      <AppBar
        component="div"
        className={classes.secondaryBar}
        color="primary"
        position="static"
        elevation={0}
      >
        <Toolbar>
          <Grid container alignItems="center">



            { props && <Grid item xs>

              
              {props.breadcrumbs && <Breadcrumbs aria-label="breadcrumb">
                 {props.breadcrumbs}
                </Breadcrumbs>
              }
     

                <Typography color="inherit" variant="h5">
                  {props.title}
                </Typography>
              </Grid>
            }
            {
              items && items 
            }
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        className={classes.secondaryBar}
        color="primary"
        position="static"
        elevation={0}
      >
        { props.tabsContent }
      </AppBar>

    </React.Fragment>
  );
}

ContentHeader.propTypes = {
  title: PropTypes.string.isRequired,
  tabsContent: PropTypes.object,
  classes: PropTypes.object.isRequired,
  onDrawerToggle: PropTypes.func,
};

export default withStyles(styles)(ContentHeader);