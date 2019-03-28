import React, {Component} from "react"

import Button from '@atlaskit/button';
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import Tabs from '@atlaskit/tabs';
//import css from 'Dante2/dist/DanteStyles.css';
import styled from 'styled-components'
import axios from 'axios'
import serialize from 'form-serialize'
import Select from '@atlaskit/select';
import FieldTextArea from '@atlaskit/field-text-area';
import FieldText from '@atlaskit/field-text';
import Form, { Field, FormHeader, FormSection, FormFooter } from '@atlaskit/form';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import { Checkbox } from '@atlaskit/checkbox';


class SettingsForm extends Component {

  constructor(props){
    super(props)
    this.state = {
      selected: 0,
      data: {},
      errors: {}
    }    
  }

  url = ()=>{
    const id = this.props.match.params.id
    return this.props.isNew ? `/apps.json`: `/apps/${this.props.store.app.key}.json`
  }

  componentDidMount(){
    this.fetchAppSettings()
  }

  fetchAppSettings = ()=>{
    const id = this.props.match.params.id
    /*axios.get(`/apps/${this.props.store.app.key}/.json?mode=${this.props.mode}`,
      { mode: this.props.mode })
      .then((response) => {
        console.log(response)
        this.setState({ data: response.data })
      }).catch((err) => {
        console.log(err)
      })*/
  }

  updateData = (data, cb)=>{
    this.setState({data: data}, cb ? cb() : null )
  }

  tabs = ()=>{
    var b = []

    return b    

  }

  errorsFor(name) {
    if (!this.state.errors[name])
      return null
    return this.state.errors[name].map((o) => o).join(", ")
  }

  fieldRenderer = (data) => {
    switch (data.type) {
      case "string":
        return <Field label={data.name} isRequired
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
          <FieldText name={`app[${data.name}]`}
            isRequired shouldFitContainer
            value={this.props.data[data.name]}
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
            value={this.props.data[data.name]}
          />
        </Field>

      case "datetime":
        return <Field label={data.name} isRequired
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>

          <DateTimePicker
            name={`app[${data.name}]`}
            defaultValue={this.props.data[data.name]}
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
              label: this.props.data[data.name],
              value: this.props.data[data.name]
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
                defaultChecked={this.props.data[data.name]}
                name={`app[${data.name}]`}
              />
              
          </div>
        
      default:
        break;
    }
  }

  onSubmitHandler = (e) => {
    e.preventDefault()
    const data = serialize(this.formRef, { hash: true, empty: true })
    this.props.update(data)
  }

  render(){
    return <ContentWrapper>
        <PageTitle>
          settings 
        </PageTitle>

            {/*<Tabs
              tabs={this.tabs()}
              {...this.props}
              selected={this.state.selected}
              onSelect={(tab, index) => { 
                  this.setState({selected: index})
                  console.log('Selected Tab', index + 1)
                }
              }
            />*/
            } 

    <form
          name="create-repo"
          onSubmit={this.onSubmitHandler.bind(this)}
          ref={form => {
            this.formRef = form;
          }}
        >
        
      <FormHeader title="App settings" />


      <FormSection>

        {
          this.props.data.config_fields.map((field) => {
            return this.fieldRenderer(field)
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

        <Button appearance="subtle">
          Cancel
        </Button>

      </FormFooter>

      </form>

    </ContentWrapper>
  }

}



export default class AppSettingsContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      app: null
    }
  }

  componentDidUpdate(prevProps, prevState){
 
  }

  componentDidMount(){
    this.fetchApp()
  }

  url = ()=>{
    return `/apps/${this.props.match.params.appId}.json`
  }

  fetchApp = ()=>{
    axios.get(this.url())
      .then((response) => {
        this.setState({ app: response.data.app })
      }).catch((err) => {
        console.log(err)
      })
  }

  // Form Event Handlers
  update = (data) => {
    axios.put(this.url(), data)
      .then((response) => {
        this.setState({ app: response.data.app }, () => {
          //this.props.updateData(response.data)
        })
      })
      .catch((error) => {
        if (error.response.data)
          this.setState({ errors: error.response.data })

        console.log(error);
      });
  };

  render(){
    return <div>
        {
          this.state.app ?
          <SettingsForm
            currentUser={this.props.currentUser}
            data={this.state.app}
            update={this.update}
            fetchApp={this.fetchApp}
            {...this.props}/> : null
        }
        </div>
  }
}
