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
    axios.get(this.url())
      .then((response) => {
        this.setState({ app: response.data.app })
      }).catch((err) => {
        console.log(err)
      })
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
      });
  };

  onSubmitHandler = (e) => {
    e.preventDefault()
    const data = serialize(this.formRef, { hash: true, empty: true })
    this.create(data)
  }

  errorsFor(name) {
    if (!this.state.errors[name])
      return null
    return this.state.errors[name].map((o) => o).join(", ")
  }

  fieldRenderer = (data, propsData) => {
    switch (data.type) {
      case "string":
        return <Field label={data.name} isRequired
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
          <FieldText name={`app[${data.name}]`}
            isRequired shouldFitContainer
            value={propsData[data.name]}
          />
        </Field>

      case "text":

        return <Field label={data.name}
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
          <FieldTextArea
            name={`app[${data.name}]`}
            shouldFitContainer
            label={`app[${data.name}]`}
            value={propsData[data.name]}
          />
        </Field>

      case "datetime":
        return <Field label={data.name} isRequired
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>

          <DateTimePicker
            name={`app[${data.name}]`}
            defaultValue={propsData[data.name]}
          //onChange={onChange}
          />
        </Field>
      case "select":
        return <Field label={data.name}
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
          <Select
            name={`app[${data.name}]`}
            isSearchable={false}
            defaultValue={{
              label: propsData[data.name],
              value: propsData[data.name]
            }}
            options={data.options.map((o) => {
              return { label: o, value: o }
            })
            }
          />
        </Field>
      case "bool":
        return <div>
          <label>{data.name}</label>
          <input
            type="checkbox"
            defaultChecked={propsData[data.name]}
            name={`app[${data.name}]`}
          />

        </div>

      default:
        break;
    }
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
            onClose={() => { }}
          >Create new app
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
                      this.state.app.config_fields.map((field) => {
                        return this.fieldRenderer(field, this.state.app)
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
