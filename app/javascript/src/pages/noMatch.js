import React, { Component } from 'react';
import Container from '../../components/Container';
import image from '../images/notfound-icon8.png'


function NoMatch({  } ) {

  return (
    <React.Fragment>
      <div>

        <Container maxWidth="lg">
            <div container spacing={2} direction={'column'}>
              <div/>
              <p variant={"h2"} className={classes.title}>
                Page NOT found
              </p>
            </div>

        </Container>
        
      </div>
    </React.Fragment>
  );
}


export default NoMatch;