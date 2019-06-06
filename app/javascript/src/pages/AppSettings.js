import React, {Component} from "react"

//import Button from '@atlaskit/button';
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
//import Tabs from '@atlaskit/tabs';
//import css from 'Dante2/dist/DanteStyles.css';
import styled from 'styled-components'
import axios from 'axios'
import serialize from 'form-serialize'
import Form, { Field, FormHeader, FormSection, FormFooter } from '@atlaskit/form';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import FieldRenderer from '../shared/FormFields'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import { PREDICATES_SEARCH, UPDATE_APP } from '../graphql/mutations'
import { toSnakeCase } from '../shared/caseConverter'


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

  onSubmitHandler = (e) => {
    e.preventDefault()
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data           = toSnakeCase(serializedData)
    this.props.update(data)
  }

  render(){
    return <ContentWrapper>
            {
              /*<Tabs
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
        

            <Paper style={{
              padding: '5em'
            }}>

              <form
                name="create-repo"
                onSubmit={this.onSubmitHandler.bind(this)}
                ref={form => {
                  this.formRef = form;
                }}>

                <FormHeader title="App settings" />

                {
                  this.props.data.configFields.map((field) => {
                    return <FieldRenderer 
                            namespace={'app'} 
                            data={field}
                            props={this.props} 
                            errors={this.state.errors}
                           />
                  })
                }

                <Button variant="contained" color="primary" type="submit">
                  Save settings
                </Button>

                <Button appearance="subtle">
                  Cancel
                </Button>

              </form>

            </Paper>

       

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
    graphql(APP, { appKey: this.props.match.params.appId}, {
      success: (data)=>{
        this.setState({ app: data.app })
      },
      errors: (error)=>{
        console.log(error)
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

  // Form Event Handlers
  update = (data) => {

    graphql(UPDATE_APP, { 
      appKey: this.props.match.params.appId,
      appParams: data.app
    }, {
      success: (data)=>{
        this.setState({ app: data.appsUpdate.app, errors: data.appsUpdate.errors }, () => {
          //this.props.updateData(response.data)
        })
      }
    })

    /*
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
    */

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
