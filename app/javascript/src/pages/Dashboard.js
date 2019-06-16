import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

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
import Container from '@material-ui/core/Container';
//import Chart from './Chart';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import DashboardCard from '../components/dashboard/card'
import DashboardCard2 from '../components/dashboard/card2'

const styles = theme => ({
  paperll: {
    maxWidth: 936,
    //marginTop: '2em',
    //marginBottom: '2em',
    margin: 'auto',
    //overflow: 'hidden',
    //marginBottom: 20,
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
    margin: '40px 16px',
  },
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },


  content: {
    flexGrow: 1,
    height: '100vh',
    //overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },

});

function Dashboard(props) {
  const { classes } = props;

  const bull = <span className={classes.bullet}>•</span>;
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <Paper className={classes.paper}>
      
      {/*
      <AppBar className={classes.searchBar} 
        position="static" color="default" elevation={0}>
        <Toolbar>
          <Grid container spacing={10} alignItems="center">
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
            <Grid item>
              <Button variant="contained" color="primary" className={classes.addUser}>
                Add user
              </Button>
              <Tooltip title="Reload">
                <IconButton>
                  <RefreshIcon className={classes.block} color="inherit" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      */}

      <div className={classes.contentWrapper}>
      

      {
        /*
      
        <Grid container 
           //className={classes.root} 
           spacing={2}>
          <Grid item xs={12}>
            <Grid container 
              //className={classes.demo} 
              justify="center" 
              spacing={1}>

              <Grid item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                      be
                      {bull}
                      nev
                      {bull}o{bull}
                      lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                      well meaning and kindly.
                      <br />
                      {'"a benevolent smile"'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>
          
              <Grid item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                      be
                      {bull}
                      nev
                      {bull}o{bull}
                      lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                      well meaning and kindly.
                      <br />
                      {'"a benevolent smile"'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                      be
                      {bull}
                      nev
                      {bull}o{bull}
                      lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                      well meaning and kindly.
                      <br />
                      {'"a benevolent smile"'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>


              <Grid item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                      be
                      {bull}
                      nev
                      {bull}o{bull}
                      lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                      well meaning and kindly.
                      <br />
                      {'"a benevolent smile"'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>
          
              <Grid item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                      be
                      {bull}
                      nev
                      {bull}o{bull}
                      lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                      well meaning and kindly.
                      <br />
                      {'"a benevolent smile"'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Word of the Day
                    </Typography>
                    <Typography variant="h5" component="h2">
                      be
                      {bull}
                      nev
                      {bull}o{bull}
                      lent
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      adjective
                    </Typography>
                    <Typography variant="body2" component="p">
                      well meaning and kindly.
                      <br />
                      {'"a benevolent smile"'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
        */
      }





      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
              <Paper className={fixedHeightPaper}>
                {/*<Chart />*/}
                aaaaaa
              </Paper>
            </Grid>
            {/* Recent Deposits */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={fixedHeightPaper}>
                <DashboardCard />
              </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <DashboardCard2 />
              </Paper>
            </Grid>
          </Grid>
        </Container>
        {/*<MadeWithLove />*/}
      </main>

      </div>

    </Paper>
  );
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);