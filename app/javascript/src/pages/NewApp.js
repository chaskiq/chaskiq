import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import Modal from '@atlaskit/modal-dialog';
import Page from '@atlaskit/page';

import axios from 'axios'
import serialize from 'form-serialize'
import Select from '@atlaskit/select';
import FieldTextArea from '@atlaskit/field-text-area';
import FieldText from '@atlaskit/field-text';
import Form, { Field, FormHeader, FormSection, FormFooter } from '@atlaskit/form';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import { Checkbox } from '@atlaskit/checkbox';
import { isEmpty } from 'lodash'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import { CREATE_APP } from '../graphql/mutations'
import {
  fieldRenderer
} from '../shared/FormFields'

export default class HomePage extends Component {
  
  static contextTypes = {
    showModal: PropTypes.func,
    addFlag: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  state = {
    isModalOpen: false,
    app: null,
    loading: false,
    errors: {}
  }

  url = () => {
    return `/apps/new.json`
  }

  fetchApp = () => {

    graphql(CREATE_APP, {operation: 'new', appParams: {}}, {
      success: (data)=>{
        this.setState({app: data.appsCreate.app})
      },
      error: (error)=>{
      }
    })

    /*
    axios.get(this.url())
      .then((response) => {
        this.setState({ app: response.data.app })
      }).catch((err) => {
        console.log(err)
      })
    */
  }


  showModal = () => {
    this.setState({ isModalOpen: true }, ()=>{
      this.fetchApp()
    });
  }

  hideModal = () => {
    this.setState({ isModalOpen: false });
  }

  // Form Event Handlers
  create = (data) => {

    graphql(CREATE_APP, { operation: 'create', appParams: data.app }, {
      success: (data) => {

        this.setState({ 
          app: data.appsCreate.app,
          errors: data.appsCreate.errors
         }, () => {
          if (isEmpty(this.state.errors))
            this.props.history.push(`/apps/${this.state.app.key}`)
          //this.updateData(response.data)
        })
      },
      error: (error) => {
      }
    })

    /*
    axios.post("/apps.json", data)
      .then((response) => {
        this.setState({ app: response.data.app }, () => {
          this.props.history.push(`/apps/${this.state.app.key}`)
          //this.updateData(response.data)
        })
      })
      .catch((error) => {
        if (error.response.data)
          this.setState({ errors: error.response.data })

        console.log(error);
      })
    */
  
  };

  onSubmitHandler = (e) => {
    e.preventDefault()
    const data = serialize(this.formRef, { hash: true, empty: true })
    this.create(data)
  }

  render() {
    return (
      <ContentWrapper>
        <PageTitle>Home</PageTitle>
        {/*<MainSection />*/}
        <ButtonGroup>
          <Button
            appearance="primary"
            onClick={this.showModal}
            onClose={() => { }}>
            Create new app
          </Button>

        </ButtonGroup>


        {
          this.state.isModalOpen && (
            <Modal
              heading="Candy bar"
              actions={[{ text: 'cancel', onClick: this.hideModal }]}
              onClose={this.hideModal}
            >

              {
                this.state.app ? <form
                  name="create-repo"
                  onSubmit={this.onSubmitHandler.bind(this)}
                  ref={form => {
                    this.formRef = form;
                  }}>

                  <FormHeader title="App settings" />

                  <FormSection>

                    {
                      this.state.app.configFields.map((field) => {
                        return fieldRenderer('app', field, {data: this.state.app}, this.state.errors)
                      })

                    }

                  </FormSection>

                  <FormFooter
                    actionsContent={[
                      {
                        id: 'submit-button',
                      },
                      {},
                    ]}
                  >
                  <Button appearance="primary" type="submit">
                      Save settings
                  </Button>

                  </FormFooter>

                </form>
                : null
              }
 


            </Modal>
          )
        }

      </ContentWrapper>
    );
  }
}
