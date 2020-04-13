import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';

const styles = theme => ({
  paper: {
    //maxWidth: 936,
    //width: '80vw',
    overflow: 'auto',
    //marginTop: '2em',
    //marginBottom: '2em',
    //margin: 'auto',
    //overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      //width: '100vw',
      height: '100vh'
      //marginTop: '0em',
    },
    [theme.breakpoints.up('md')]: {
      //marginTop: '2em',
      height: '100vh',
      //width: '80vw',
    },
    [theme.breakpoints.up('lg')]: {
      //marginTop: '2em',
    },

  },
  searchBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  searchInput: {
    fontSize: theme.typography.fontSize,
  },
  block: {
    display: 'block',
  },
  addUser: {
    marginRight: theme.spacing(1),
  },
  contentWrapper: {
    [theme.breakpoints.up('sm')]: {
      margin: '27px 50px',
      maxWidth: '71vw',
      overflowX: 'scroll'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      padding: '1em'
    },
  },
});

function Content(props) {
  const { classes } = props;

  return (
    <Paper className={classes.paper}>
      
      <AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
        <Toolbar>
          {
            false ?
          
          <Grid container spacing={10} alignItems="center">
            
            {
              props.searchBar ? 

              <React.Fragment>
                <Grid item>
                  <SearchIcon className={classes.block} color="inherit" />
                </Grid>

                <Grid item xs>
                  
                    <TextField
                    fullWidth
                    placeholder="Search by email address, phone number, or user UID"
                    InputProps={{
                      disableUnderline: true,
                      className: classes.searchInput,
                    }}
                  /> 
                </Grid>
              </React.Fragment>
            : null 
            }
            
            <Grid item>
              {props.actions ? props.actions : null}
              {/*<Button variant="contained" color="primary" className={classes.addUser}>
                    Add user
                  </Button>
    
                  <Tooltip title="Reload">
                    <IconButton>
                      <RefreshIcon className={classes.block} color="inherit" />
                    </IconButton>
                  </Tooltip>*/}

            </Grid>
          </Grid> : null 
        }

          {props.actions ? props.actions : null}
        </Toolbar>
      </AppBar>

      <div className={classes.contentWrapper}>

        {/*<Typography color="textSecondary" align="center">
          No users for this project yet
        </Typography>*/}

        {props.children}

      </div>
    
      
    
    </Paper>
  );
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Content);