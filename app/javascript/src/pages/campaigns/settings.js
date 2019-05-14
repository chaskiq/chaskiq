import React, {Component} from "react"
import Select from '@atlaskit/select';
import FieldText from '@atlaskit/field-text';
import Button from '@atlaskit/button';
import Form, { FormHeader, FormSection, FormFooter } from '@atlaskit/form';
import {isEmpty} from 'lodash'
import axios from 'axios'
import serialize from 'form-serialize'

import graphql from "../../graphql/client"
import { UPDATE_CAMPAIGN, CREATE_CAMPAIGN } from "../../graphql/mutations"

import {
  fieldRenderer
} from "../../shared/FormFields"


export default class CampaignSettings extends Component {
  constructor(props){
    super(props)
    //console.log(props)
    this.state = {
      eventResult:
      'Click into and out of the input above to trigger onBlur & onFocus in the Fieldbase',
      data: this.props.data,
      errors: {}
    }
  }

  formRef: any;

  // Footer Button Handlers
  submitClickHandler = () => {
    this.formRef.submit();
  };

  onSubmitHandler = (e)=>{
    e.preventDefault()
    const data = serialize(this.formRef, { hash: true, empty: true })
    this.props.match.params.id === "new" ? 
      this.create(data) : this.update(data)
  }

  // Form Event Handlers
  create = (data) => {

    graphql(CREATE_CAMPAIGN, {
      appKey: this.props.store.app.key,
      mode: this.props.mode,
      operation: "create",
      campaignParams: data.campaign
    }, {
      success: (data) => {
        this.setState({
          data: data.campaignCreate.campaign,
          errors: data.campaignCreate.errors
        }, ()=>{
          if(!isEmpty(this.state.errors)){
            return
          }

          this.props.history.push(`/apps/${this.props.store.app.key}/messages/${this.props.mode}/${this.state.data.id}`)
          this.props.updateData(response.data)
        })
      }
    })


    /*axios.post(`/apps/${this.props.store.app.key}/campaigns.json?mode=${this.props.mode}`, data)
    .then( (response)=> {
      this.setState({data: response.data}, ()=>{ 
        this.props.history.push(`/apps/${this.props.store.app.key}/messages/${this.props.mode}/${this.state.data.id}`)
        this.props.updateData(response.data)
      })
    })
    .catch( (error)=> {
      if(error.response.data)
        this.setState({errors: error.response.data})
      
      console.log(error);
    });*/

  };

  // Form Event Handlers
  update = (data) => {

    const params = {
      appKey: this.props.store.app.key,
      id: this.state.data.id,
      campaignParams: data.campaign
    }

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data)=>{
        const result = data.campaignUpdate
        this.setState({ data: result.campaign, errors: result.errors  }, () => {
          this.props.updateData(result.campaign)
        })
      }, 
      error: (error)=>{

      }
    })

    /*axios.put(`${this.props.url}.json?mode=${this.props.mode}`, data)
    .then( (response)=> {
      this.setState({data: response.data}, ()=>{
        this.props.updateData(response.data) 
      })
    })
    .catch( (error)=> {
      if(error.response.data)
        this.setState({errors: error.response.data})
      
      console.log(error);
    });*/
  };

  render() {
    console.log(this.state.data)
    return (
      <div
        style={{
          //display: 'flex',
          paddingTop: '20px',
          width: '60%',
          margin: '0 auto',
          flexDirection: 'row',
        }}
      >
        <form
          name="create-repo"
          onSubmit={this.onSubmitHandler.bind(this)}
          ref={form => {
            this.formRef = form;
          }}
        >
          <FormHeader title="Create a new campaign" />

            <FormSection>

              {
                this.state.data.configFields.map((field) => {
                  return fieldRenderer('campaign', field, this.state, this.state.errors)
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
              Create repository
            </Button>
            <Button appearance="subtle">
              Cancel
            </Button>
          </FormFooter>
        </form>
      </div>
    );
  }
}