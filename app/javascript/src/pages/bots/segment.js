import React,{Component} from 'react'
import graphql from '../../graphql/client'
import {
  UPDATE_CAMPAIGN, 
  PREDICATES_SEARCH, 
  UPDATE_BOT_TASK
} from '../../graphql/mutations' 
//import {} from '../../graphql/queries'
import { parseJwt, generateJWT } from '../../components/segmentManager/jwt'
import SegmentManager from '../../components/segmentManager'
import styled from '@emotion/styled'
import Moment from 'react-moment';

import {
  Typography,
  Avatar,
  Tab,
  Tabs,
  Chip,
  Button
} from '@material-ui/core'
import gravatar from '../../shared/gravatar'

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

export default class Segment extends Component {

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
    console.log("AAA", this.props.data)
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