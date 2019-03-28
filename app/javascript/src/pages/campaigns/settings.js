import React, {Component} from "react"
import Select from '@atlaskit/select';
import FieldText from '@atlaskit/field-text';
import Button from '@atlaskit/button';
import Form, { Field, FormHeader, FormSection, FormFooter } from '@atlaskit/form';
import { DatePicker, DateTimePicker, TimePicker } from '@atlaskit/datetime-picker';

import FieldTextArea from '@atlaskit/field-text-area';
import axios from 'axios'
import serialize from 'form-serialize'

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
    const data = serialize(this.formRef, { hash: true })
    this.props.match.params.id === "new" ? 
      this.create(data) : this.update(data)
  }

  // Form Event Handlers
  create = (data) => {
    axios.post(`/apps/${this.props.store.app.key}/campaigns.json?mode=${this.props.mode}`, data)
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
    });
  };

  // Form Event Handlers
  update = (data) => {
    axios.put(`${this.props.url}.json?mode=${this.props.mode}`, data)
    .then( (response)=> {
      this.setState({data: response.data}, ()=>{
        this.props.updateData(response.data) 
      })
    })
    .catch( (error)=> {
      if(error.response.data)
        this.setState({errors: error.response.data})
      
      console.log(error);
    });
  };

  errorsFor(name){
    if(!this.state.errors[name])
      return null
    return this.state.errors[name].map((o)=> o).join(", ")
  }

  fieldRenderer = (data)=>{
    switch (data.type) {
      case "string":
        return <Field label={data.name} isRequired
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
                <FieldText name={`campaign[${data.name}]`}
                  isRequired shouldFitContainer
                  value={this.state.data[data.name]}
                />
              </Field>

      case "text":

        return <Field label={data.name}
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
          <FieldTextArea
            name={`campaign[${data.name}]`}
            shouldFitContainer
            label={`campaign[${data.name}]`}
            value={this.state.data[data.name]}
          />
        </Field>

      case "datetime":
        return <Field label={data.name} isRequired
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>

          <DateTimePicker
            name={`campaign[${data.name}]`}
            defaultValue={this.state.data[data.name] || new Date }
          //onChange={onChange}
          />
          </Field>
      case "select":
        return <Field label={data.name}
          isInvalid={this.errorsFor(data.name)}
          invalidMessage={this.errorsFor(data.name)}>
          <Select
            name={`campaign[${data.name}]`}
            isSearchable={false}
            defaultValue={{ 
              label: this.state.data[data.name], 
              value: this.state.data[data.name] }}
            options={ data.options.map((o)=>{
                return { label: o, value: o }
              })
            }
          />
        </Field>
      default:
        break;
    }
  }

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
          <FormHeader title="Create a new campaign" />

            <FormSection>

              {
                this.state.data.config_fields.map((field)=>{
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