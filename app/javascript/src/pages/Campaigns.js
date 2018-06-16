import React, {Component} from "react"

import Select from '@atlaskit/select';
import FieldText from '@atlaskit/field-text';
import Button from '@atlaskit/button';
import Checkbox, { CheckboxGroup } from '@atlaskit/checkbox';

import Form, { Field, FormHeader, FormSection, FormFooter } from '@atlaskit/form';
import FieldTextArea from '@atlaskit/field-text-area';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import MainSection from '../components/MainSection';
import Tabs from '@atlaskit/tabs';
import { DanteEditor, Dante } from 'Dante2/es/components/init.js';
import css from 'Dante2/dist/DanteStyles.css';
import styled from 'styled-components'

type State = {
  eventResult: string,
};

const EditorContainer = styled.div`
  overflow: auto;
  width: 100%;
  height: 60vh;
  padding: 57px;
  background: #f9f8f8;
`

class CampaignSettings extends Component {
  state = {
    eventResult:
      'Click into and out of the input above to trigger onBlur & onFocus in the Fieldbase',
  };

  formRef: any;

  // Form Event Handlers
  onSubmitHandler = () => {
    console.log('onSubmitHandler');
  };

  onValidateHandler = () => {
    console.log('onValidateHandler');
  };

  onResetHandler = () => {
    console.log('onResetHandler');
  };

  onChangeHandler = () => {
    console.log('onChangeHandler');
  };
  onBlurHandler = () => {
    console.log('onBlurHandler');
  };
  onFocusHandler = () => {
    console.log('onFocusHandler');
  };

  // Footer Button Handlers
  submitClickHandler = () => {
    this.formRef.submit();
  };

  render() {
    return (
      <div style={{ overflow: 'auto', width: '100%', height: '100vh'}}>
      <div
        style={{
          display: 'flex',
          width: '400px',
          margin: '0 auto',
          minHeight: '60vh',
          flexDirection: 'column',
        }}
      >
        <Form
          name="create-repo"
          onSubmit={this.onSubmitHandler}
          onReset={this.onResetHandler}
          ref={form => {
            this.formRef = form;
          }}
          action="//httpbin.org/get"
          method="GET"
          target="submitFrame"
        >
          <FormHeader title="Create a new campaign" />

          <FormSection>

            {
              /*
            <Field label="Owner">
              <Select
                isSearchable={false}
                defaultValue={{ label: 'Atlassian', value: 'atlassian' }}
                options={[
                  { label: 'Atlassian', value: 'atlassian' },
                  { label: 'Sean Curtis', value: 'scurtis' },
                  { label: 'Mike Gardiner', value: 'mg' },
                  { label: 'Charles Lee', value: 'clee' },
                ]}
                name="owner"
              />
            </Field>

            <Field label="Project" isRequired>
              <Select
                options={[
                  { label: 'Atlaskit', value: 'brisbane' },
                  { label: 'Bitbucket', value: 'bb' },
                  { label: 'Confluence', value: 'conf' },
                  { label: 'Jira', value: 'jra' },
                  { label: 'Stride', value: 'stride' },
                ]}
                placeholder="Choose a project&hellip;"
                isRequired
                name="project"
              />
            </Field>
              */
            }


            <Field label="Campaign name" isRequired>
              <FieldText name="campaign_name" isRequired shouldFitContainer />
            </Field>

            <Field label="Subject name" isRequired>
              <FieldText name="campaign_subject" isRequired shouldFitContainer />
            </Field>


            <Field label="From name" isRequired>
              <FieldText name="campaign_from_name" isRequired shouldFitContainer />
            </Field>

            <Field label="From email" isRequired>
              <FieldText name="campaign_from_email" isRequired shouldFitContainer />
            </Field>


            <Field label="Timezone">
              <Select
                isSearchable={false}
                defaultValue={{ label: 'Atlassian', value: 'atlassian' }}
                options={[
                  { label: 'Atlassian', value: 'atlassian' },
                  { label: 'Sean Curtis', value: 'scurtis' },
                  { label: 'Mike Gardiner', value: 'mg' },
                  { label: 'Charles Lee', value: 'clee' },
                ]}
                name="timezone"
              />
            </Field>


            <Field isInvalid invalidMessage="An invalid message example">
              <FieldTextArea label="Is Invalid & showing message" />
            </Field>

            {
              /*
            <Field label="Access level">
              <CheckboxGroup>
                <Checkbox
                  label="This is a private repository"
                  name="access-level"
                  value="private"
                />
              </CheckboxGroup>
            </Field>

            <Field label="Include a README?">
              <Select
                isSearchable={false}
                defaultValue={{ label: 'No', value: 'no' }}
                options={[
                  { label: 'No', value: 'no' },
                  { label: 'Yes, with a template', value: 'yes-with-template' },
                  {
                    label: 'Yes, with a tutorial (for beginners)',
                    value: 'yes-with-tutorial',
                  },
                ]}
                name="include_readme"
              />
            </Field>
              */
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
            <Button appearance="subtle">Cancel</Button>
          </FormFooter>
        </Form>
      </div>
      </div>
    );
  }
}

class CampaignSegment extends Component {
  state = {
    eventResult:
      'Click into and out of the input above to trigger onBlur & onFocus in the Fieldbase',
  };

  formRef: any;

  // Form Event Handlers
  onSubmitHandler = () => {
    console.log('onSubmitHandler');
  };

  onValidateHandler = () => {
    console.log('onValidateHandler');
  };

  onResetHandler = () => {
    console.log('onResetHandler');
  };

  onChangeHandler = () => {
    console.log('onChangeHandler');
  };
  onBlurHandler = () => {
    console.log('onBlurHandler');
  };
  onFocusHandler = () => {
    console.log('onFocusHandler');
  };

  // Footer Button Handlers
  submitClickHandler = () => {
    this.formRef.submit();
  };

  render() {
    return (
      <div style={{ overflow: 'auto', width: '100%', height: '100vh'}}>
      <div
        style={{
          display: 'flex',
          width: '400px',
          margin: '0 auto',
          minHeight: '60vh',
          flexDirection: 'column',
        }}
      >
        <Form
          name="create-repo"
          onSubmit={this.onSubmitHandler}
          onReset={this.onResetHandler}
          ref={form => {
            this.formRef = form;
          }}
          action="//httpbin.org/get"
          method="GET"
          target="submitFrame"
        >
          <FormHeader title="Create a new campaign" />

          <FormSection>

            {
              /*
            <Field label="Owner">
              <Select
                isSearchable={false}
                defaultValue={{ label: 'Atlassian', value: 'atlassian' }}
                options={[
                  { label: 'Atlassian', value: 'atlassian' },
                  { label: 'Sean Curtis', value: 'scurtis' },
                  { label: 'Mike Gardiner', value: 'mg' },
                  { label: 'Charles Lee', value: 'clee' },
                ]}
                name="owner"
              />
            </Field>

            <Field label="Project" isRequired>
              <Select
                options={[
                  { label: 'Atlaskit', value: 'brisbane' },
                  { label: 'Bitbucket', value: 'bb' },
                  { label: 'Confluence', value: 'conf' },
                  { label: 'Jira', value: 'jra' },
                  { label: 'Stride', value: 'stride' },
                ]}
                placeholder="Choose a project&hellip;"
                isRequired
                name="project"
              />
            </Field>
              */
            }


            <Field label="Campaign name" isRequired>
              <FieldText name="campaign_name" isRequired shouldFitContainer />
            </Field>

            <Field label="Subject name" isRequired>
              <FieldText name="campaign_subject" isRequired shouldFitContainer />
            </Field>


            <Field label="From name" isRequired>
              <FieldText name="campaign_from_name" isRequired shouldFitContainer />
            </Field>

            <Field label="From email" isRequired>
              <FieldText name="campaign_from_email" isRequired shouldFitContainer />
            </Field>


            <Field label="Timezone">
              <Select
                isSearchable={false}
                defaultValue={{ label: 'Atlassian', value: 'atlassian' }}
                options={[
                  { label: 'Atlassian', value: 'atlassian' },
                  { label: 'Sean Curtis', value: 'scurtis' },
                  { label: 'Mike Gardiner', value: 'mg' },
                  { label: 'Charles Lee', value: 'clee' },
                ]}
                name="timezone"
              />
            </Field>


            <Field isInvalid invalidMessage="An invalid message example">
              <FieldTextArea label="Is Invalid & showing message" />
            </Field>

            {
              /*
            <Field label="Access level">
              <CheckboxGroup>
                <Checkbox
                  label="This is a private repository"
                  name="access-level"
                  value="private"
                />
              </CheckboxGroup>
            </Field>

            <Field label="Include a README?">
              <Select
                isSearchable={false}
                defaultValue={{ label: 'No', value: 'no' }}
                options={[
                  { label: 'No', value: 'no' },
                  { label: 'Yes, with a template', value: 'yes-with-template' },
                  {
                    label: 'Yes, with a tutorial (for beginners)',
                    value: 'yes-with-tutorial',
                  },
                ]}
                name="include_readme"
              />
            </Field>
              */
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
            <Button appearance="subtle">Cancel</Button>
          </FormFooter>
        </Form>
      </div>
      </div>
    );
  }
}

class CampaignEditor extends Component {

  componentDidMount(){
    this.editor = new Dante({   
      upload_url: "http://localhost:9292/uploads/new",    
      store_url: "http://localhost:3333/store.json",    
      el: "campaign-editor"  
    })
    this.editor.render()
  }

  render(){
    return <EditorContainer>
            <div id="campaign-editor" style={{
              background: 'white', 
              paddingTop: '34px'
            }}/>
           </EditorContainer>
  }
}

const tabs = [
  { label: 'Settings', content: <CampaignSettings/> },
  { label: 'Segment', content: <CampaignSegment/> },
  { label: 'Editor', content: <CampaignEditor/> }
];


export default class CampaignContainer extends Component {

  render(){
    return <ContentWrapper>
        <PageTitle>Home</PageTitle>
       
        <h1>FORM HERE </h1>

        <Tabs
          tabs={tabs}
          onSelect={(tab, index) => console.log('Selected Tab', index + 1)}
        />

      </ContentWrapper>

  }
}
