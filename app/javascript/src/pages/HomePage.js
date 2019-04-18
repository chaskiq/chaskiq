import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import logo from '../images/logo.png';
import Page, { Grid, GridColumn } from '@atlaskit/page';


export default class HomePage extends Component {
  static contextTypes = {
    showModal: PropTypes.func,
    addFlag: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  render() {
    return (
      <ContentWrapper>

        <Page>
          <Grid>
            <GridColumn medium={8}>
              <PageTitle> Welcome to Hermessenger</PageTitle>

              <ButtonGroup>
                      <Button
                        appearance="primary"
                        onClick={(e) => {
                          e.preventDefault()
                          this.props.history.push(`/apps/`)
                        }
                        }
                        onClose={() => { }}
                      >view apps
                </Button>

                      <Button onClick={this.context.addFlag}>
                        flag test
                </Button>
              </ButtonGroup>


              <p>
                Lorem ipsum dolor sit amet and consectetur adipisicing elit.
                Blanditiis voluptatum perspiciatis doloribus dignissimos accusamus
                commodi, nobis ut, error iusto, quas vitae nesciunt consequatur
                possimus labore! Mollitia est quis minima asperiores.
            </p>
            </GridColumn>
            <GridColumn medium={4}>
              
              <img src={logo} width={'100%'} />
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Blanditiis voluptatum perspiciatis doloribus dignissimos accusamus
                commodi, nobis ut, error iusto, quas vitae nesciunt consequatur
                possimus labore! Mollitia est quis minima asperiores.
            </p>
            </GridColumn>
            <GridColumn>
              <h2>Content below which takes up remaining space</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Blanditiis voluptatum perspiciatis doloribus dignissimos accusamus
                commodi, nobis ut, error iusto, quas vitae nesciunt consequatur
                possimus labore! Mollitia est quis minima asperiores.
            </p>
            </GridColumn>
          </Grid>
        </Page>


      </ContentWrapper>
    );
  }
}
