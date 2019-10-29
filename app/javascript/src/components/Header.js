import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import HelpIcon from '@material-ui/icons/Help';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import ListMenu from './ListMenu'
import gravatar from "../shared/gravatar"

const lightColor = 'rgba(255, 255, 255, 0.7)';

const styles = theme => {
  return {
  secondaryBar: {
    zIndex: 0,
  },
  menuButton: {
    marginLeft: -theme.spacing(1),
  },
  iconButtonAvatar: {
    padding: 4,
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.white,
    //'&:hover': {
    //  color: theme.palette.common.white,
    //},
  },
  button: {
    borderColor: lightColor,
  },
  apa: {
    minHeight: '52px',
    color: theme.palette.primary.white,
    backgroundColor: theme.palette.primary.background
  }
}
}

function Header(props) {
  const { classes, onDrawerToggle, signout, visitApp, apps } = props;

  return (
    <React.Fragment>
      <AppBar color="primary" position="sticky" elevation={1}>
        <Toolbar className={classes.apa}>
          <Grid container spacing={2} alignItems="center">
            
            <Hidden smUp>
              <Grid item>
                <IconButton
                  color="inherit"
                  aria-label="Open drawer"
                  onClick={onDrawerToggle}
                  className={classes.menuButton}
                >
                  <MenuIcon />
                </IconButton>
              </Grid>
            </Hidden>

            <Hidden smDown>
              <Grid item>
                <ListMenu handleClick={visitApp} options={apps}/>
              </Grid>
            </Hidden>

            <Grid item xs />
          
            <Grid item>
              <Typography className={classes.link} 
                component="a" href="#">
                Go to docs
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Alerts • No alters">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <IconButton 
                onClick={()=>{
                  signout()
                }}
                color="inherit" 
                className={classes.iconButtonAvatar}>
                <Avatar className={classes.avatar} 
                  src={gravatar(props.currentUser.email)}
                />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onDrawerToggle: PropTypes.func.isRequired,
};

export default withStyles(styles)(Header);