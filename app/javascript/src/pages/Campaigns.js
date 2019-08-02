import React, { Component } from "react"
import {
  Route,
  Link
} from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
//import Tabs from '@atlaskit/tabs';
import {Avatar, Typography} from '@material-ui/core';
import Moment from 'react-moment';

import styled from '@emotion/styled'
import axios from 'axios'
import serialize from 'form-serialize'

import Button from '@material-ui/core/Button';
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
//import DataTable from '../components/dataTable'
import DataTable from '../components/newTable'

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import gravatar from '../shared/gravatar'

import {setCurrentPage} from '../actions/navigation'

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
      this.props.app.segments[0].id
    )*/
    this.search()
  }

  handleSave = (e) => {
    const predicates = parseJwt(this.state.jwt)
    //console.log(predicates)

    const params = {
      appKey: this.props.app.key,
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
      appKey: this.props.app.key,
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
      collection={this.state.app_users}
      updatePredicate={this.updatePredicate.bind(this)}
      addPredicate={this.addPredicate.bind(this)}
      deletePredicate={this.deletePredicate.bind(this)}
      search={this.search.bind(this)}

      loading={this.props.searching}
      columns={[
        //{name: 'id', title: 'id'},
        {name: 'email', title: 'email', 
          getCellValue: row => (row ? 

            <NameWrapper onClick={(e)=>(this.showUserDrawer(row))}>
              <AvatarWrapper>
                <div 
                  //className={classes.margin} 
                  color={row.online ? "primary" : 'secondary' }
                  variant="dot">
                  <Avatar
                    name={row.email}
                    size="medium"
                    src={gravatar(row.email)}
                  />
                </div>
              </AvatarWrapper>

              <Typography>{row.email}</Typography>
              <Typography variant="overline" display="block">
                {row.name}
              </Typography>
            </NameWrapper>

           : undefined)
        },
        {name: 'lastVisitedAt', 
          title: 'lastVisitedAt',
          getCellValue: row => (row ? <Moment fromNow>
                                        {row.lastVisitedAt}
                                      </Moment> : undefined)
        },
        {name: 'state', title: 'state'},
        {name: 'online', title: 'online'},
        {name: 'lat',  title: 'lat'},
        {name: 'lng',  title: 'lng'},
        {name: 'postal', title: 'postal'},
        {name: 'browser', title: 'browser'},
        {name: 'referrer', title: 'referrer'},
        {name: 'os', title: 'os'},
        {name: 'osVersion', title: 'osVersion'},
        {name: 'lang', title: 'lang'},

      ]}

      defaultHiddenColumnNames={
        ['id', 
        'state', 
        'online', 
        'lat', 
        'lng', 
        'postal',
        'browserLanguage', 
        'referrer', 
        'os', 
        'osVersion',
        'lang'
        ]}
      //selection [],
      tableColumnExtensions={[
        //{ columnName: 'id', width: 150 },
        { columnName: 'email', width: 250 },
        { columnName: 'lastVisitedAt', width: 120 },
        { columnName: 'os', width: 100 },
        { columnName: 'osVersion', width: 100 },
        { columnName: 'state', width: 80 },
        { columnName: 'online', width: 80 },
        //{ columnName: 'amount', align: 'right', width: 140 },
      ]}
      leftColumns={ ['email']}
      rightColumns={ ['online']}
      //toggleMapView={this.toggleMapView}
      //map_view={this.state.map_view}
      //enableMapView={true}
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
    return `/apps/${this.props.app.key}/campaigns/${id}`
  }

  componentDidMount() {
    this.fetchCampaign()
  }

  fetchCampaign = () => {
    const id = this.props.match.params.id

    if(id === "new"){
      graphql(CREATE_CAMPAIGN, {
        appKey: this.props.app.key,
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
        appKey: this.props.app.key,
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
        return <CampaignSettings 
                  {...this.props}
                  data={this.state.data}
                  mode={this.props.mode}
                  url={this.url()}
                  updateData={this.updateData}
                />
      case 2:
        return <CampaignSegment
          {...this.props}
          data={this.state.data}
          url={this.url()}
          updateData={this.updateData} 
        />
      case 3:
        return this.renderEditorForCampaign()
    }
  }

  isNew = ()=>{
    return this.props.match.params.id === "new"
  }


  render() {

    const title = this.state.data.name ? 
    `${this.props.mode} Campaign: ${this.state.data.name}` : `new ${this.props.mode}`

    return <div>

      <ContentHeader 
        title={ title }
        tabsContent={
          this.isNew() ? null : this.tabsContent() 
        }
      />

      <Content>

        {
          !isEmpty(this.state.data) ? 
            this.isNew() ?
            <CampaignSettings 
              {...this.props}
              data={this.state.data}
              mode={this.props.mode}
              url={this.url()}
              updateData={this.updateData}
            /> : this.renderTabcontent() 
          : null
        }

      </Content>

    </div>
  }
}

class CampaignContainer extends Component {

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

    this.props.dispatch(
      setCurrentPage('Campaigns')
    )

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

  renderActions = ()=>{
    return <Button variant={"contained"} color={"primary"}
                  onClick={this.createNewCampaign}>
                  create new campaign
                </Button>
  }

  render() {
 
    return <div>

      <Route exact path={`${this.props.match.url}`}
        render={(props) => (
          <div>

            <Content actions={this.renderActions()}>

              

               {
                 !this.state.loading && this.state.campaigns.length > 0 ?
                 <DataTable
                  rows={this.state.campaigns} 
                  loading={this.state.loading}
                  meta={this.state.meta}
                  defaultHiddenColumnNames={[]}
                  search={this.init.bind(this)}
                  columns={[
                            {name: 'name', title: 'name', 
                             getCellValue: row => (row ? <Link to={`${this.props.match.url}/${row.id}`}>
                                                          {row.name}
                                                        </Link> : undefined)

                          },
                            {name: 'subject', title: 'subject'},
                            {name: 'fromName', title: 'fromName'},
                            {name: 'fromEmail', title: 'fromEmail'},
                            {name: 'replyEmail', title: 'replyEmail'},
                            {name: 'description', title: 'description'},
                            {name: 'timezone', title: 'timezone'},
                            {name: 'scheduledAt', title: 'scheduledAt'},
                            {name: 'scheduledTo', title: 'scheduledTo'}
                          ]}
                  //selection [],
                  tableColumnExtensions={[
                    {name: 'name', width: 250 },
                    {name: 'subject', width: 250 },
                  ]}
                  //leftColumns={ ['email']}
                  //rightColumns={ ['online']} 
              /> : null }
             

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



function mapStateToProps(state) {

  const { auth, app } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(CampaignContainer))


