import PropTypes from 'prop-types';
import React, { Component } from 'react';
//import Button, { ButtonGroup } from '@atlaskit/button';
import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import logo from '../images/logo.png';
//import Page, { Grid, GridColumn } from '@atlaskit/page';


export default class HomePage extends Component {
  static contextTypes = {
    showModal: PropTypes.func,
    addFlag: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  state = {
    enabledTour: false
  }

  componentDidmount(){
    window.TourManagerEnabled = () => {
      return this.state.enabledTour //alert("oaoaoaoa")
    }
  }

  componentDidUnmount() {
    window.TourManagerEnabled = null
  }

  render() {
    return (
      <ContentWrapper>

        aaaaa

      </ContentWrapper>
    );
  }
}
