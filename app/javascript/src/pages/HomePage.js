import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ContentWrapper from '../components/ContentWrapper';

import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import {AnchorLink} from '../shared/RouterLink'


const styles = theme => ({
  contentWrapper: {
    margin: '40px 16px',
  },
});

function HomePage({ classes } ) {

  return (
    <React.Fragment>
      <ContentWrapper>

        <Container maxWidth="lg" className={classes.contentWrapper}>
          <Grid container 
            spacing={3} 
            direction={"column"} 
            justify={"center"}>
            
            <Typography variant={"h4"}>
              Welcome to Chaskiq
            </Typography>
            <Typography variant={"body1"}>
              Help your customers and your team
            </Typography>


            <Box m={2}>
              <AnchorLink 
                to={`/apps/`}>
                {'view apps'}
              </AnchorLink>

              <AnchorLink 
                to={`/apps/new`}>
                {'new app'}
              </AnchorLink>            
            </Box>



          </Grid>
        </Container>
        
      </ContentWrapper>
    </React.Fragment>
  );
}


export default withStyles(styles)(HomePage);