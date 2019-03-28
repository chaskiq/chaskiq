import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';

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
        <PageTitle>Welcome to Hermessenger</PageTitle>
        {/*<MainSection />*/}
        <ButtonGroup>
          
          <Button
            appearance="primary"
            onClick={(e)=>{
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
      </ContentWrapper>
    );
  }
}
