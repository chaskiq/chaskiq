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
import axios from 'axios'
import serialize from 'form-serialize'

import CampaignSettings from "./campaigns/settings"
import SegmentManager from '../components/segmentManager'

const EditorContainer = styled.div`
  overflow: auto;
  width: 100%;
  height: 60vh;
  padding: 57px;
  background: #f9f8f8;
`

class CampaignSegment extends Component {

  componentDidMount(){
    this.props.actions.fetchAppSegment(
      this.props.store.app.segments[0].id
    )
  }

  render(){
    return <SegmentManager {...this.props}/>
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


export default class CampaignContainer extends Component {
  constructor(props){
    super(props)
    this.state = {
      selected: 0
    }    
  }


  tabs = ()=>(
    [
      { label: 'Settings', content: <CampaignSettings {...this.props} /> },
      { label: 'Audience', content: <CampaignSegment  {...this.props} /> },
      { label: 'Editor', content: <CampaignEditor/> }
    ]
  )

  render(){
    return <ContentWrapper>
        <PageTitle>FORM HERE</PageTitle>
        <Tabs
          tabs={this.tabs()}
          {...this.props}
          selected={this.state.selected}
          onSelect={(tab, index) => { 
              this.setState({selected: index})
              console.log('Selected Tab', index + 1)
            }
          }
        />
      </ContentWrapper>
  }
}
