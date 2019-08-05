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
import Moment from 'react-moment';
import styled from '@emotion/styled'
import axios from 'axios'
import serialize from 'form-serialize'

import {Button, Grid} from '@material-ui/core';
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
import { PREDICATES_SEARCH, 
  UPDATE_CAMPAIGN, 
  CREATE_CAMPAIGN,
  DELIVER_CAMPAIGN
 } from '../graphql/mutations'

import {getAppUser} from '../actions/app_user'
import {toggleDrawer} from '../actions/drawer'

import Table from '../components/table/index'

import { Done, Face } from '@material-ui/icons';
import {
  Typography,
  Avatar,
  Chip,
  Tab,
  Tabs
} from '@material-ui/core'


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
    //console.log(this.state.jwt)
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

  showUserDrawer = (o)=>{
    this.props.dispatch(
      toggleDrawer({ rightDrawer: true }, ()=>{
        this.props.dispatch(getAppUser(o.id))
      })
    )
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

        {name: 'id', title: 'id', hidden: true},
        {field: 'email', title: 'email', 
          render: row => (row ? 

            <NameWrapper onClick={(id)=> this.showUserDrawer(row) }>
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
        {field: 'lastVisitedAt', 
          title: 'lastVisitedAt',
          render: row => (row ? <Moment fromNow>
                                        {row.lastVisitedAt}
                                      </Moment> : undefined)
        },
        {field: 'state', title: 'state'},
        {field: 'online', title: 'online'},
        {field: 'lat',  title: 'lat'},
        {field: 'lng',  title: 'lng'},
        {field: 'postal', title: 'postal'},
        {field: 'browser', title: 'browser'},
        {field: 'referrer', title: 'referrer'},
        {field: 'os', title: 'os'},
        {field: 'osVersion', title: 'osVersion'},
        {field: 'lang', title: 'lang'},

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
    console.log(props)
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

  handleSend = (e) => {

    const params = {
      appKey: this.props.app.key,
      id: this.state.data.id,
    }

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data)=>{
        this.updateData(data.campaignDeliver.campaign, null)
        //this.setState({ status: "saved" })
      }, 
      error: ()=>{

      }
    })
  }

  campaignName = (name)=>{
    switch (name) {
      case "campaigns":
        return "Mailing Campaign"
        break;
      case "user_auto_messages":
        return "In app messages"
    
      default:
        return name
        break;
    }
  }


  render() {

    const title = this.state.data.name ? 
      `${this.campaignName(this.props.mode)}: ${this.state.data.name}` : 
      this.campaignName(this.props.mode)

    return <div>

      <ContentHeader 
        title={ title }
        items={
          <Grid item>

              <Chip 
                variant="outlined" 
                color="secondary" 
                size="small" 
                label="Clickable Chip"
                deleteIcon={<Done />} 
                //onDelete={handleDelete} 
                icon={<Face />} 
              />


              <Button 
                variant="outlined" color="inherit" size="small">
                {this.state.data.state}
              </Button>
          </Grid>
        }
        tabsContent={
          this.isNew() ? null : this.tabsContent() 
        }
      />

      <Content actions={
          //&& (this.state.data.state != "sent" && this.state.data.state != "delivering")  ?
          this.props.mode === "campaigns" ?
        
            <Grid container justify={"flex-end"}>

              <Button variant="outlined" 
                color="primary" 
                size="small"
                
                onClick={(e) => {
                  window.open(`${window.location.origin}/apps/${this.props.app.key}/premailer/${this.state.data.id}`, '_blank');
                }
              }>
                Preview
              </Button>

              {
                /*
                  <Button variant="contained" color="primary" size="small">
                    test delivery
                  </Button>                
                */
              }

              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                onClick={this.handleSend}>
                deliver email
              </Button>

            </Grid> : null 
        }>

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
                  <Table
                    meta={this.state.meta}
                    data={this.state.campaigns}
                    title={"Campaigns"}
                    defaultHiddenColumnNames={[]}
                    search={this.init.bind(this)}
                    columns={[
                      {field: 'name', title: 'name', 
                        render: row => (row ? <Link to={`${this.props.match.url}/${row.id}`}>
                                                    {row.name}
                                                  </Link> : undefined)
                      },
                      {field: 'subject', title: 'subject'},
                      {field: 'fromName', title: 'fromName', hidden: true},
                      {field: 'fromEmail', title: 'fromEmail', hidden: true},
                      {field: 'replyEmail', title: 'replyEmail', hidden: true},
                      {field: 'description', title: 'description', hidden: true},
                      {field: 'timezone', title: 'timezone'},
                      {field: 'scheduledAt', title: 'scheduledAt', type: "datetime"},
                      {field: 'scheduledTo', title: 'scheduledTo', type: "datetime"}
                    ]}
                  >
                    
                  </Table>

                  : null 
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


