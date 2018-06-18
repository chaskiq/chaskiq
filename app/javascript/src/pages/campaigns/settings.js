import React, {Component} from "react"
import Select from '@atlaskit/select';
import FieldText from '@atlaskit/field-text';
import Button from '@atlaskit/button';
import Form, { Field, FormHeader, FormSection, FormFooter } from '@atlaskit/form';
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
    axios.post(`/apps/${this.props.store.app.key}/campaigns.json`, data)
    .then( (response)=> {
      this.setState({data: response.data}, ()=>{ 
        this.props.history.push(`/apps/${this.props.store.app.key}/campaigns/${this.state.data.id}`)
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
    axios.put(`${this.props.match.url}.json`, data)
    .then( (response)=> {
      this.setState({data: response.data}, ()=>{ console.log('ss')})
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

            <Field label="Campaign name" isRequired>
              <FieldText name="campaign[name]" 
                isRequired shouldFitContainer
                value={this.state.data.name}
               />
            </Field>

            <Field label="Subject name" 
              isInvalid={this.errorsFor('subject')} 
              invalidMessage={this.errorsFor('subject')}>
              <FieldText name="campaign[subject]" 
                        isRequired 
                        shouldFitContainer
                        value={this.state.data.subject} />
            </Field>

            <Field label="From name" isRequired 
              isInvalid={this.errorsFor('from_name')} 
              invalidMessage={this.errorsFor('from_name')}>
              <FieldText name="campaign[from_name]" 
                isRequired 
                shouldFitContainer
                value={this.state.data.from_name} />
            </Field>

            <Field label="From email" isRequired
              isInvalid={this.errorsFor('from_email')} 
              invalidMessage={this.errorsFor('from_email')}>
              <FieldText name="campaign[from_email]" 
                isRequired shouldFitContainer 
                value={this.state.data.from_email}/>
            </Field>

            <Field label="Reply email" isRequired 
              isInvalid={this.errorsFor('reply_email')} 
              invalidMessage={this.errorsFor('reply_email')}>
              <FieldText name="campaign[reply_email]" 
                isRequired shouldFitContainer
                value={this.state.data.reply_email} />
            </Field>

            {
              /*
            <Field label="Timezone" 
              isInvalid={this.errorsFor('timezone')} 
              invalidMessage={this.errorsFor('timezone')}>
              <Select
                name="campaign[timezome]"
                isSearchable={false}
                value={{ label: 'Atlassian', value: 'atlassian' }}
                options={[
                  { label: 'Atlassian', value: 'atlassian' },
                  { label: 'Sean Curtis', value: 'scurtis' },
                  { label: 'Mike Gardiner', value: 'mg' },
                  { label: 'Charles Lee', value: 'clee' },
                ]}
              />
            </Field>
              */
            }


            <Field  label="Description" 
                    isInvalid={this.errorsFor('description')} 
                    invalidMessage={this.errorsFor('description')}>
              <FieldTextArea 
                name="campaign[description]"
                shouldFitContainer 
                label="campaign description"
                value={this.state.data.description} 
              />
            </Field>

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