import React, {Component} from "react"

import Select from '@atlaskit/select';
import FieldText from '@atlaskit/field-text';
import Button from '@atlaskit/button';
import Checkbox, { CheckboxGroup } from '@atlaskit/checkbox';
import {
  Route,
  Link
} from 'react-router-dom'
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
import {parseJwt} from '../components/segmentManager/jwt'

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

  handleSave = (e)=>{
    console.log(this)
    const predicates = parseJwt(this.props.store.jwt)
    console.log(predicates)

    axios.put(`${this.props.match.url}/2.json`, { campaign: { 
      segments: predicates.data }
    })
    .then( (response)=> {
      console.log(this.state)
      console.log(data)
    })
    .catch( (error)=> {
      console.log(error);
    }); 

  }

  render(){
    return <SegmentManager {...this.props}>

              {
                this.props.store.jwt ? 
                  <Button isLoading={false} 
                    appearance={'link'}
                    onClick={this.handleSave}>
                    <i className="fas fa-chart-pie"></i>
                    {" "}
                    Save Segment
                  </Button> : null
              }

           </SegmentManager>
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

class CampaignForm extends Component {

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


export default class CampaignContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      campaigns: []
    }
  }

  componentDidMount(){
    axios.get(`${this.props.match.url}.json`)
    .then((response)=>{
        this.setState({campaigns: response.data})
    }).catch((err)=>{
      console.log(err)
    })
  }

  render(){
    return <div>




              <Route exact path={`${this.props.match.url}`} 
                render={(props)=>(
                  <div>
                    {
                      this.state.campaigns.map((o)=> {
                        return <div>
                                {o.from_email} | {o.from_name}
                                <Button onClick={()=> this.props.history.push(`${this.props.match.url}/${o.id}`)}>
                                  edit
                                </Button>
                               </div>
                      })
                    }
                  </div>
              )} /> 


              <Route exact path={`${this.props.match.url}/:id`} 
                render={(props)=>(
   
                  <CampaignForm
                    currentUser={this.props.currentUser}
                    {...this.props}
                    {...props}
                  />

              )} /> 

           </div>
  }
}
