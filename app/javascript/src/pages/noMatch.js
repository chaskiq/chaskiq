import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ContentWrapper from '../components/ContentWrapper';


import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import {AnchorLink} from '../shared/RouterLink'
import image from '../../../assets/images/notfound-icon8.png'

const styles = theme => ({
  logo: {
    background: `url(${theme.palette.primary.logo})`,
    width: '100px',
    height: '100px',
    backgroundSize: '113%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '-4px -1px'
  },
  contentWrapper: {
    //margin: '40px 16px',
    background: `url(${image})`,
    backgroundRepeat: 'no-repeat',
    backgroundPositionX: 'right',
    backgroundSize: '100%',
    height: '100%',
    marginBottom: '0px'
  },
  title: {
    fontWeight: '900'
  }
});

const useStyles = makeStyles({
  root: {
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
});

function NoMatch({ classes } ) {

  return (
    <React.Fragment>
      <div className={classes.contentWrapper}>

        <Container maxWidth="lg">
            <Grid container spacing={2} direction={'column'}>
              <div className={classes.logo}/>
              <Typography variant={"h2"} className={classes.title}>
                Page NOT found
              </Typography>
            </Grid>

            {/*<Box m={4}>
              <Typography variant={"body1"}>
                Help your customers and your team
              </Typography>
            </Box>*/}

        </Container>
        
      </div>
    </React.Fragment>
  );
}


export default withStyles(styles)(NoMatch);