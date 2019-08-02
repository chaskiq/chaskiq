import React, {Component} from "react"
import {Button, Grid} from '@material-ui/core';


import {isEmpty} from 'lodash'
import axios from 'axios'
import serialize from 'form-serialize'

import graphql from "../../graphql/client"
import { UPDATE_CAMPAIGN, CREATE_CAMPAIGN } from "../../graphql/mutations"

import FieldRenderer from "../../shared/FormFields"
import {toSnakeCase} from '../../shared/caseConverter'
import moment from 'moment-timezone';

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

    window.tz = moment.tz
  }

  formRef: any;

  // Footer Button Handlers
  submitClickHandler = () => {
    this.formRef.submit();
  };

  onSubmitHandler = (e)=>{
    e.preventDefault()
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    this.props.match.params.id === "new" ? 
      this.create(data) : this.update(data)
  }

  // Form Event Handlers
  create = (data) => {

    graphql(CREATE_CAMPAIGN, {
      appKey: this.props.app.key,
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

          this.props.history.push(`/apps/${this.props.app.key}/messages/${this.props.mode}/${this.state.data.id}`)
          this.props.updateData(this.state.data)
        })
      }
    })

  };

  // Form Event Handlers
  update = (data) => {

    const params = {
      appKey: this.props.app.key,
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

  };

  render() {
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
          <h3>Create a new campaign</h3>


          
          <Grid container spacing={3}>
      
            {
              this.state.data.configFields.map((field) => {
                return <Grid item 
                          xs={field.grid.xs} 
                          sm={field.grid.sm}>
                          <FieldRenderer 
                            namespace={'campaign'} 
                            data={field}
                            props={this.state} 
                            errors={this.state.errors}
                          />
                      </Grid>
              })
            }


            <Grid item>

              <Button onClick={this.onSubmitHandler.bind(this)}
                      variant="contained" 
                      color="primary">
                Save
              </Button>

              <Button appearance="subtle">
                Cancel
              </Button>
            </Grid>

          </Grid>


       
        </form>
      </div>
    );
  }
}