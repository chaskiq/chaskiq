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

import DemoApp from '../editor'
import serialize from 'form-serialize'

import CampaignSettings from "./campaigns/settings"
import SegmentManager from '../components/segmentManager'
import {parseJwt, generateJWT} from '../components/segmentManager/jwt'

const EditorContainer = styled.div`
  //overflow: auto;
  //height: 60vh;
  width: 100%;

  padding: 57px;
  background: #f9f8f8;
`

class CampaignSegment extends Component {

  constructor(props){
    super(props)
    this.state = {
      jwt: null, 
      app_users: [],
      search: false,
      meta: {}
    }
  }
  componentDidMount(){
    /*this.props.actions.fetchAppSegment(
      this.props.store.app.segments[0].id
    )*/
    this.search()
  }

  handleSave = (e)=>{
    const predicates = parseJwt(this.state.jwt)
    console.log(predicates)

    axios.put(`${this.props.match.url}.json`, { 
      campaign: { 
        segments: predicates.data 
      }
    })
    .then( (response)=> {
      console.log(this.state)
    })
    .catch( (error)=> {
      console.log(error);
    }); 

  }

  updateData = (data, cb)=>{
    const newData = Object.assign({}, this.props.data, {segments: data.data}) 
    this.props.updateData( newData , cb ? cb() : null )
  }

  updatePredicate = (data, cb)=>{
    
    /*const new_predicates = this.props.data.segments.map((o)=> {
      if(data.attribute === o.attribute){
        return data
      } else {
        return o
      }
    })*/

    const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    if(cb)
      cb(jwtToken)
    this.setState({jwt: jwtToken}, ()=> this.updateData(parseJwt(this.state.jwt), this.search ) )
  }

  addPredicate = (data, cb)=>{

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    const new_predicates = this.props.data.segments.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    //console.log(parseJwt(jwtToken))
    if(cb)
      cb(jwtToken)

    this.setState({jwt: jwtToken}, ()=> this.updateData(parseJwt(this.state.jwt) ) )
  }

  deletePredicate(data){
    const jwtToken = generateJWT(data)
    this.setState({jwt: jwtToken}, ()=> this.updateData(parseJwt(this.state.jwt), this.search ) )
  }

  search = ()=>{
    this.setState({searching: true})
    // jwt or predicates from segment
    console.log(this.state.jwt)
    const data = this.state.jwt ? parseJwt(this.state.jwt).data : this.props.data.segments
    const predicates_data = { data: {
                                predicates: data.filter( (o)=> o.comparison )
                              }
                            }
                            
    axios.post(`/apps/${this.props.store.app.key}/search.json`, 
      predicates_data )
    .then( (response)=> {
      this.setState({
        app_users: response.data.collection,
        meta: response.data.meta, 
        searching: false
      })
    })
    .catch( (error)=> {
      console.log(error);
    });   
  }

  render(){
    return <SegmentManager {...this.props} 
              predicates={this.props.data.segments}
              meta={this.state.meta}
              app_users={this.state.app_users}
              updatePredicate={this.updatePredicate.bind(this)}
              addPredicate={this.addPredicate.bind(this)}
              deletePredicate={this.deletePredicate.bind(this)}
              search={this.search.bind(this)}
            >
              {
                this.state.jwt ? 
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


  /*
  
  
          window.debug = true
          window.read_only = false
          window.store_method = "PUT"
          window.attachment_pach = "#{manage_campaign_attachments_path(@campaign)}"
          
          window.save_url = "#{wizard_path}.json";

          window.save_handler = function(html, plain, serialized){
            $.ajax({
              url: window.save_url,
              method: "PUT",
              dataType: "json",
              data: {
                campaign: {
                  html_content: html,
                  plain_content: plain,
                  html_serialized: serialized
                }
              },
              success: function(data){
                console.log("success")
              },
              error: function(err){
                console.log(err)
              }
            })
          }

          window.successStoreHandler = function(response){
            var data = response.data
            //if(window.location.pathname != targetUrl){
            //  // setup dante defaults again pointing update url
            //  window.dante_store_url = targetUrl + ".json";
            //  window.dante_upload_url = targetUrl + "/uploads.json";
            //  window.dante_store_method = "put";
            //  var targetUrlForPush = targetUrl + "/edit";
            //  window.history.pushState({url: "" + targetUrlForPush}, "edit"//, targetUrlForPush);
            //}
          }

          window.oembed_url = "/oembed?url=";

          var empty = {"entityMap":{},"blocks":[{"key":"761n6","text":"Write something","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"f1qmb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"efvk7","text":"Dante2 Inc.\nSantiago, Chile\nYou Received this email because you signed up on our website or made purchase from us.","type":"footer","depth":0,"inlineStyleRanges":[{"offset":0,"length":114,"style":"CUSTOM_FONT_SIZE_13px"},{"offset":0,"length":114,"style":"CUSTOM_COLOR_#8d8181"}],"entityRanges":[],"data":{}},{"key":"7gh7t","text":"Unsubscribe","type":"unsubscribe_button","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"enabled":false,"fill":"fill","displayPopOver":true,"data":{},"href":"http://mailerlite.com/some_unsubscribe_link_here","border":"default","forceUpload":false,"containerStyle":{"textAlign":"left","margin":"0px 13px 0px 0px"},"label":"click me","float":"left","buttonStyle":{"color":"#fff","backgroundColor":"#3498db","padding":"6px 12px","display":"inline-block","fontFamily":"Helvetica","fontSize":13,"float":"none","border":"1px solid #3498db"}}}]}

          window.data = #{@campaign.html_serialized ? raw(@campaign.html_serialized) : 'empty'};
  
  */

  emptyContent = ()=>{
    return {"entityMap":{},"blocks":[{"key":"761n6","text":"Write something","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"f1qmb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"efvk7","text":"Dante2 Inc.\nSantiago, Chile\nYou Received this email because you signed up on our website or made purchase from us.","type":"footer","depth":0,"inlineStyleRanges":[{"offset":0,"length":114,"style":"CUSTOM_FONT_SIZE_13px"},{"offset":0,"length":114,"style":"CUSTOM_COLOR_#8d8181"}],"entityRanges":[],"data":{}},{"key":"7gh7t","text":"Unsubscribe","type":"unsubscribe_button","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"enabled":false,"fill":"fill","displayPopOver":true,"data":{},"href":"http://mailerlite.com/some_unsubscribe_link_here","border":"default","forceUpload":false,"containerStyle":{"textAlign":"left","margin":"0px 13px 0px 0px"},"label":"click me","float":"left","buttonStyle":{"color":"#fff","backgroundColor":"#3498db","padding":"6px 12px","display":"inline-block","fontFamily":"Helvetica","fontSize":13,"float":"none","border":"1px solid #3498db"}}}]}
  }

  render(){
    return <EditorContainer>

            <div id="campaign-editor" style={{
              background: 'white', 
              paddingTop: '34px'
            }}>

            <DemoApp
              content={this.emptyContent()}
              config={
                {
                  api_key: "86c28a410a104c8bb58848733c82f840",
                  debug: true,
                  oembed_uri: "/",
                  read_only: false,
                  upload_url: "/",
                  renderDraggables: window.parent.window.renderDraggables,
                  data_storage: {
                    save_handler: ()=> console.log("dd"),
                    url: "/sdffs",
                    method: "post",
                    success_handler: ()=> console.log("ff"),
                  }
                  }
                }
            />
            </div>
           </EditorContainer>
  }
}

class CampaignForm extends Component {

  constructor(props){
    super(props)
    this.state = {
      selected: 0,
      data: {}
    }    
  }

  componentDidMount(){
    axios.get(`${this.props.match.url}.json`)
    .then((response)=>{
      console.log(response)
      this.setState({data: response.data})
    }).catch((err)=>{
      console.log(err)
    })
  }

  updateData = (data, cb)=>{
    this.setState({data: data}, cb ? cb() : null )
  }

  tabs = ()=>{
    var b = []

    const a = [
      { label: 'Settings', content: <CampaignSettings {...this.props} 
                                                      data={this.state.data} 
                                                      updateData={this.updateData} 
                                                      /> }
    ]

    if(this.state.data.id){
      b = [
        { label: 'Audience', content: <CampaignSegment  {...this.props} 
                                                        data={this.state.data} 
                                                        updateData={this.updateData} /> },
        { label: 'Editor',   content: <CampaignEditor   {...this.props} 
                                                        data={this.state.data} /> }
      ]      
    }

    return a.concat(b)

  }

  render(){

    return <ContentWrapper>
        <PageTitle>FORM HERE</PageTitle>

        {
          this.state.data.id || this.props.match.params.id === "new" ?
            <Tabs
              tabs={this.tabs()}
              {...this.props}
              selected={this.state.selected}
              onSelect={(tab, index) => { 
                  this.setState({selected: index})
                  console.log('Selected Tab', index + 1)
                }
              }
            /> : null
        }

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

  createNewCampaign = (e)=>{
    this.props.history.push(`${this.props.match.url}/new`)
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

                    <Button onClick={this.createNewCampaign}>
                      create new campaign
                    </Button>
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
