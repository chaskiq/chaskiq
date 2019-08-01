import PropTypes from 'prop-types';
import React, { Component } from 'react';
//import Button, { ButtonGroup } from '@atlaskit/button';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import logo from '../images/logo.png';
//import Page, { Grid, GridColumn } from '@atlaskit/page';
import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'



export default class HomePage extends Component {
  static contextTypes = {
    showModal: PropTypes.func,
    addFlag: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  render() {
    return (<ThemeProvider theme={{ mode: 'dark' }}>
      <ContentWrapper>

        {/*<Page >
                  <Grid>
                    <GridColumn medium={3}>
                    </GridColumn>
                    <GridColumn medium={6}>
                      <div style={{
                        textAlign: 'center'
                      }}>
                        <PageTitle> Welcome to Hermessenger</PageTitle>
                        <img src={logo} width={'100%'} />
                        
                        <ButtonGroup>
                        <Button
                          appearance="primary"
                          onClick={(e) => {
                            e.preventDefault()
                            window.location = "/users/sign_in"
                          }
                          }
                          onClose={() => { }}
                        >Log in
                        </Button>
                      </ButtonGroup>
                      </div>
                    </GridColumn>
                    <GridColumn medium={3}>
                   
                    </GridColumn>
                  </Grid>
                </Page>*/}


      </ContentWrapper>
      </ThemeProvider>
      );
  }
}
