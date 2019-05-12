import React, { Component } from "react"

import Button from '@atlaskit/button';
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import Tabs from '@atlaskit/tabs';
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

import graphql from "../graphql/client"
import { CAMPAIGN, CAMPAIGNS  } from "../graphql/queries"
import { PREDICATES_SEARCH } from '../graphql/mutations'
//import { INSERT_COMMMENT } from '../graphql/mutations'

// @flow
import DynamicTable from '@atlaskit/dynamic-table';

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
    axios.put(`${this.props.url}/messages/${this.props.mode}.json`, {
      campaign: {
        segments: predicates.data
      }
    })
      .then((response) => {
        console.log(this.state)
      })
      .catch((error) => {
        console.log(error);
      });

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

  search = () => {
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
      page: 1
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

    /*axios.post(`/apps/${this.props.store.app.key}/search.json`,
      predicates_data)
      .then((response) => {
        this.setState({
          app_users: response.data.collection,
          meta: response.data.meta,
          searching: false
        })
      })
      .catch((error) => {
        console.log(error);
      });*/
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
      data: {}
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

    graphql(CAMPAIGN, {
      appKey: this.props.store.app.key,
      mode: this.props.mode,
      id: parseInt(id)
    }, {
      success: (data) => {
        this.setState({
          data: data.app.campaign
        })
      }
      })

    /*
    axios.get(`/apps/${this.props.store.app.key}/messages/${this.props.mode}/${id}.json`,
      { mode: this.props.mode })
      .then((response) => {
        console.log(response)
        this.setState({ data: response.data })
      }).catch((err) => {
        console.log(err)
      })
    */
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

  tabs = () => {
    var b = []

    const a = [
      {
        label: 'Settings', content: <CampaignSettings {...this.props}
          data={this.state.data}
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

  render() {
    return <ContentWrapper>
      <PageTitle>
        Campaign {`: ${this.state.data.name}`}
      </PageTitle>
      {
        this.state.data.id || this.props.match.params.id === "new" ?
          <Tabs
            tabs={this.tabs()}
            {...this.props}
            selected={this.state.selected}
            onSelect={(tab, index) => {
              this.setState({ selected: index })
              console.log('Selected Tab', index + 1)
            }
            }
          /> : null
      }

    </ContentWrapper>
  }

}


export default class CampaignContainer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      campaigns: []
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

  init = () => {
    this.setState({
      loading: true
    })

    //debugger
    graphql(CAMPAIGNS, { 
      appKey: this.props.match.params.appId, 
      mode: this.props.match.params.message_type 
    }, {success: (data)=>{
        this.setState({
          campaigns: data.app.campaigns,
          loading: false
        })
    }})


    /*axios.get(`/apps/${this.props.match.params.appId}/messages/${this.props.match.params.message_type}`)
      .then((response) => {
        this.setState({
          campaigns: response.data,
          loading: false
        })
      }).catch((err) => {
        console.log(err)
      })
    */
  }

  createNewCampaign = (e) => {
    this.props.history.push(`${this.props.match.url}/new`)
  }

  render() {
    return <div>
      <Route exact path={`${this.props.match.url}`}
        render={(props) => (
          <div>

            {
              !this.state.loading ?
                <DataTable {...this.props}
                  data={this.state.campaigns}
                  createNewCampaign={this.createNewCampaign}

                /> : null
            }

            {
              this.state.loading ? <p>loading</p> : null
            }
          </div>
        )} />


      <Route exact path={`${this.props.match.url}/:id`}
        render={(props) => (

          <CampaignForm
            currentUser={this.props.currentUser}
            mode={this.props.match.params.message_type}
            {...this.props}
            {...props}
          />

        )} />

    </div>
  }
}



class DataTable extends Component<{}, {}> {


  constructor(props) {
    super(props)


    this.createHead = (withWidth: boolean) => {
      return {
        cells: [
          {
            key: 'name',
            content: 'Name',
            isSortable: true,
            width: withWidth ? 25 : undefined,
          },
          {
            key: 'subject',
            content: 'Subject',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 15 : undefined,
          },
          {
            key: 'state',
            content: 'State',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 10 : undefined,
          },
          {
            key: 'scheduled_at',
            content: 'scheduled_at',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 10 : undefined,
          },

          {
            key: 'scheduled_to',
            content: 'scheduled_to',
            shouldTruncate: true,
            isSortable: true,
            width: withWidth ? 10 : undefined,
          },
          {
            key: 'action',
            content: 'Actions',
            shouldTruncate: true,
          },
        ],
      };
    };

    this.head = this.createHead(true);

    this.rows = this.props.data.map((campaign, index) => ({
      key: `row-${index}-${campaign.nm}`,
      cells: [
        {
          key: `${campaign.id}-name`,
          content: (campaign.name),
        },
        {
          key: `${campaign.id}-subject`,
          content: campaign.subject,
        },
        {
          key: `${campaign.id}-state`,
          content: <Lozenge
                    appearance={campaign.state == "enabled" ? 'success' : 'moved'}
                    isBold>
                    {campaign.state}
                  </Lozenge>,
        },
        {
          key: `${campaign.id}-scheduled_at`,
          content: campaign.scheduled_at,
        },

        {
          key: `${campaign.id}-scheduled_to`,
          content: campaign.scheduled_to,
        },

        {
          content: (
            <Button onClick={() => this.props.history.push(`${this.props.match.url}/${campaign.id}`)}>
              edit
            </Button>

          ),
        }
      ],
    }));

  }

  renderCaption = () => {
    return <div>

      <div style={{ float: 'right' }}>
        <Button
          onClick={this.props.createNewCampaign}>
          create new campaign
        </Button>
      </div>

      Campaigns {this.props.match.params.message_type}
    </div>
  }


  render() {
    return (
      <Wrapper>
        <DynamicTable
          caption={this.renderCaption()}
          head={this.head}
          rows={this.rows}
          rowsPerPage={10}
          defaultPage={1}
          loadingSpinnerSize="large"
          isLoading={false}
          isFixedSize
          defaultSortKey="term"
          defaultSortOrder="ASC"
          onSort={() => console.log('onSort')}
          onSetPage={() => console.log('onSetPage')}
        />
      </Wrapper>
    );
  }
}
