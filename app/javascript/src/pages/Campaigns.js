import React, { Component } from "react"

import Button from '@atlaskit/button';
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
//import Tabs from '@atlaskit/tabs';
import Avatar from '@atlaskit/avatar';

import styled from 'styled-components'
import axios from 'axios'
import serialize from 'form-serialize'
import Lozenge from '@atlaskit/lozenge'

import CampaignSettings from "./campaigns/settings"
import CampaignEditor from "./campaigns/edito"
import SegmentManager from '../components/segmentManager'
import CampaignStats from "./campaigns/stats"

import { isEmpty } from 'lodash'

import { parseJwt, generateJWT } from '../components/segmentManager/jwt'
import TourManager from '../components/Tour'
import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'

import graphql from "../graphql/client"
import { CAMPAIGN, CAMPAIGNS  } from "../graphql/queries"
import { PREDICATES_SEARCH, UPDATE_CAMPAIGN, CREATE_CAMPAIGN } from '../graphql/mutations'

// @flow
import DynamicTable from '@atlaskit/dynamic-table';
import DataTable from '../components/dataTable'

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

const Wrapper = styled.div`
  min-width: 600px;
`;

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

class CampaignSegment extends Component {

  constructor(props) {
    super(props)
    this.state = {
      jwt: null,
      app_users: [],
      search: false,
      meta: {}
    }
  }
  componentDidMount() {
    /*this.props.actions.fetchAppSegment(
      this.props.store.app.segments[0].id
    )*/
    this.search()
  }

  handleSave = (e) => {
    const predicates = parseJwt(this.state.jwt)
    //console.log(predicates)

    const params = {
      appKey: this.props.store.app.key,
      id: this.props.data.id,
      campaignParams: {
        segments: predicates.data
      }
    }

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        debugger
        //this.props.updateData(data.campaignUpdate.campaign, null)
        //this.setState({ status: "saved" })
      },
      error: () => {

      }
    })
  }

  updateData = (data, cb) => {
    const newData = Object.assign({}, this.props.data, { segments: data.data })
    this.props.updateData(newData, cb ? cb() : null)
  }

  updatePredicate = (data, cb) => {
    const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    if (cb)
      cb(jwtToken)
    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt), this.search))
  }

  addPredicate = (data, cb) => {

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    const new_predicates = this.props.data.segments.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    //console.log(parseJwt(jwtToken))
    if (cb)
      cb(jwtToken)

    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt)))
  }

  deletePredicate(data) {
    const jwtToken = generateJWT(data)
    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt), this.search))
  }

  search = (page) => {
    this.setState({ searching: true })
    // jwt or predicates from segment
    console.log(this.state.jwt)
    const data = this.state.jwt ? parseJwt(this.state.jwt).data : this.props.data.segments
    const predicates_data = {
      data: {
        predicates: data.filter((o) => o.comparison)
      }
    }

    graphql(PREDICATES_SEARCH, { 
      appKey: this.props.store.app.key,
      search: predicates_data,
      page: page || 1
    },{
      success: (data) => { 
        const appUsers = data.predicatesSearch.appUsers
        this.setState({
          app_users: appUsers.collection,
          meta: appUsers.meta,
          searching: false
        })
      },
      error: (error) => {
        debugger
      }
    })
  }

  render() {
    return <SegmentManager {...this.props}
      loading={this.state.searching}
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

class CampaignForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: 0,
      data: {},
      tabValue: 0
    }
  }

  url = () => {
    const id = this.props.match.params.id
    return `/apps/${this.props.store.app.key}/campaigns/${id}`
  }

  componentDidMount() {
    this.fetchCampaign()
  }

  fetchCampaign = () => {
    const id = this.props.match.params.id

    if(id === "new"){
      graphql(CREATE_CAMPAIGN, {
        appKey: this.props.store.app.key,
        mode: this.props.mode,
        operation: "new",
        campaignParams: {}
      }, {
          success: (data) => {
            this.setState({
              data: data.campaignCreate.campaign
            })
          }
        })
    }else{
      graphql(CAMPAIGN, {
        appKey: this.props.store.app.key,
        mode: this.props.mode,
        id: parseInt(id),
      }, {
        success: (data) => {
          this.setState({
            data: data.app.campaign
          })
        }
      })
    }
  }

  updateData = (data, cb) => {
    this.setState({ data: data }, cb ? cb() : null)
  }

  renderEditorForCampaign = ()=>{
    switch (this.props.mode) {
      case 'tours':
        return <TourManager
          {...this.props}
          url={this.url()}
          updateData={this.updateData}
          data={this.state.data}
        />
        break;
    
      default:
        return <CampaignEditor
          {...this.props}
          url={this.url()}
          updateData={this.updateData}
          data={this.state.data} />
        break;
    }
    
  }

  tabssss = () => {
    var b = []

    const a = [
      {
        label: 'Settings', content: <CampaignSettings {...this.props}
          data={this.state.data}
          mode={this.props.mode}
          url={this.url()}
          updateData={this.updateData}
        />
      }
    ]

    if (this.state.data.id) {
      b = [
        {
          label: 'Audience', content: <CampaignSegment
            {...this.props}
            data={this.state.data}
            url={this.url()}
            updateData={this.updateData} />
        },
        {
          label: 'Editor', content: this.renderEditorForCampaign()
        }
      ]
    }

    const stats = [
      {
        label: 'Stats', content: <CampaignStats  {...this.props}
          url={this.url()}
          data={this.state.data}
          fetchCampaign={this.fetchCampaign}
          updateData={this.updateData} />
      }
    ]

    // return here if campaign not sent
    const tabs = a.concat(b)

    if (!isEmpty(this.state.data)) {
      return this.props.match.params.id === "new" ? tabs : stats.concat(tabs)
    } else {
      return []
    }
  }

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="Stats" />
              <Tab textColor="inherit" label="Settings" />
              <Tab textColor="inherit" label="Audience" />
              <Tab textColor="inherit" label="Editor" />
            </Tabs>
  }


  renderTabcontent = ()=>{

    switch (this.state.tabValue){
      case 0:
        return <CampaignStats  
                  {...this.props}
                  url={this.url()}
                  data={this.state.data}
                  fetchCampaign={this.fetchCampaign}
                  updateData={this.updateData} 
                />
      case 1:
        return <CampaignSegment
          {...this.props}
          data={this.state.data}
          url={this.url()}
          updateData={this.updateData} 
        />

      case 2:
        return <CampaignSettings 
                  {...this.props}
                  data={this.state.data}
                  mode={this.props.mode}
                  url={this.url()}
                  updateData={this.updateData}
                />
      case 3:
        return this.renderEditorForCampaign()
    }
  }

  render() {
    return <div>


      <ContentHeader 
        title={ `Campaign: ${this.state.data.name}`}
        tabsContent={
          this.tabsContent()
        }
      />

      <Content>

        {
          this.props.match.params.id === "new" ?
          <CampaignSettings 
            {...this.props}
            data={this.state.data}
            mode={this.props.mode}
            url={this.url()}
            updateData={this.updateData}
          /> : !isEmpty(this.state.data) ? 
          this.renderTabcontent() : null 
        }

      </Content>

    </div>
  }

}


export default class CampaignContainer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      campaigns: [],
      meta: {}
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.match.params.message_type !== prevProps.match.params.message_type) {
      this.init()
    }
  }

  componentDidMount() {
    this.init()
  }

  init = (page) => {
    this.setState({
      loading: true
    })

    graphql(CAMPAIGNS, { 
      appKey: this.props.match.params.appId, 
      mode: this.props.match.params.message_type,
      page: page || 1
    }, {
      success: (data)=>{
        const {collection , meta} = data.app.campaigns
        this.setState({
          campaigns: collection,
          meta: meta,
          loading: false
        })
    }})
  }

  createNewCampaign = (e) => {
    this.props.history.push(`${this.props.match.url}/new`)
  }

  handleRowClick = (a, data, c)=>{
    const row = this.state.campaigns[data.dataIndex]
    this.props.history.push(`${this.props.match.url}/${row.id}`)
  }

  render() {
    return <div>

      <Route exact path={`${this.props.match.url}`}
        render={(props) => (
          <div>

            <Content>

              <div style={{ float: 'right' }}>
                <Button
                  onClick={this.createNewCampaign}>
                  create new campaign
                </Button>
              </div>
              
              {
                !this.state.loading ?
                  <DataTable {...this.props}
                    data={this.state.campaigns}
                    title={this.props.mode}
                    columns={['name', 'subject', 'state', 'scheduled_at', 'scheduled_to','actions']} 
                    meta={this.state.meta}
                    search={this.init.bind(this)}
                    onRowClick={this.handleRowClick.bind(this)}
                  /> : null
              }

              {
                this.state.loading ? <p>loading</p> : null
              }
            </Content>
          </div>
        )} 
      />


      <Route exact path={`${this.props.match.url}/:id`}
        render={(props) => (
          <CampaignForm
            currentUser={this.props.currentUser}
            mode={this.props.match.params.message_type}
            {...this.props}
            {...props}
          />          
        )} 
      />

    </div>
  }
}

