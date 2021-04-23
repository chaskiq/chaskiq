import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'

import { AnchorLink } from '../shared/RouterLink'
import { connect } from 'react-redux'
// import Tabs from '@atlaskit/tabs';
import Moment from 'react-moment'

import UpgradeButton from '../components/upgradeButton'

import CampaignSettings from './campaigns/settings'
import CampaignEditor from './campaigns/editor'
import SegmentManager from '../components/segmentManager'
import DeleteDialog from '../components/DeleteDialog'
import CampaignStats from '../components/stats'

import { isEmpty } from 'lodash'

import { parseJwt, generateJWT } from '../components/segmentManager/jwt'
import TourManager from '../components/Tour'
import ContentHeader from '../components/PageHeader'
import Content from '../components/Content'
import EmptyView from '../components/EmptyView'
import FilterMenu from '../components/FilterMenu'
import Badge from '../components/Badge'
import graphql from '../graphql/client'
import { CAMPAIGN, CAMPAIGNS, CAMPAIGN_METRICS } from '../graphql/queries'
import {
  PREDICATES_SEARCH,
  UPDATE_CAMPAIGN,
  CREATE_CAMPAIGN,
  DELIVER_CAMPAIGN,
  PURGE_METRICS,
  DELETE_CAMPAIGN,
  CLONE_MESSAGE
} from '../graphql/mutations'

import { getAppUser } from '../actions/app_user'
import { toggleDrawer } from '../actions/drawer'

import Table from '../components/Table'

// import SelectMenu from '../components/selectMenu'

import Tabs from '../components/Tabs'
import Button from '../components/Button'
import CircularProgress from '../components/Progress'

import {

  Pause,

  SendIcon,

  EmailIcon,
  MessageIcon,
  FilterFramesIcon,
  ClearAll,
  DeleteOutlineRounded,
  CopyContentIcon
} from '../components/icons'

import { setCurrentSection, setCurrentPage } from '../actions/navigation'

import userFormat from '../components/Table/userFormat'

import { errorMessage, successMessage } from '../actions/status_messages'

class CampaignSegment extends Component {
  constructor (props) {
    super(props)
    this.state = {
      jwt: null,
      app_users: [],
      search: false,
      meta: {}
    }
  }

  componentDidMount () {
    /* this.props.actions.fetchAppSegment(
      this.props.app.segments[0].id
    ) */
    this.search()
  }

  handleSave = (_e) => {
    const predicates = parseJwt(this.state.jwt)
    // console.log(predicates)

    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        segments: predicates.data
      }
    }

    graphql(UPDATE_CAMPAIGN, params, {
      success: (_data) => {
        this.props.successMessage()
      },
      error: () => {}
    })
  };

  updateData = (data, cb) => {
    const newData = Object.assign({}, this.props.data, { segments: data.data })
    this.props.updateData(newData, cb ? cb() : null)
  };

  updatePredicate = (data, cb) => {
    const jwtToken = generateJWT(data)
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken)
    this.setState({ jwt: jwtToken }, () =>{
      this.updateData(parseJwt(this.state.jwt), this.search)
    }
    )
  };

  addPredicate = (data, cb) => {
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    const new_predicates = this.props.data.segments.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken)
    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt))
    )
  };

  deletePredicate (data) {
    const jwtToken = generateJWT(data)
    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt), this.search)
    )
  }

  search = (page) => {
    this.setState({ searching: true })
    // jwt or predicates from segment
    // console.log(this.state.jwt)
    const data = this.state.jwt
      ? parseJwt(this.state.jwt).data
      : this.props.data.segments
    const predicates_data = {
      data: {
        predicates: data.filter((o) => o.comparison)
      }
    }

    graphql(
      PREDICATES_SEARCH,
      {
        appKey: this.props.app.key,
        search: predicates_data,
        page: page || 1
      },
      {
        success: (data) => {
          const appUsers = data.predicatesSearch.appUsers
          this.setState({
            app_users: appUsers.collection,
            meta: appUsers.meta,
            searching: false
          })
        },
        error: (_error) => {
        }
      }
    )
  };

  showUserDrawer = (o) => {
    this.props.dispatch(
      toggleDrawer({ userDrawer: true }, () => {
        this.props.dispatch(getAppUser(o.id))
      })
    )
  };

  render () {
    return (
      <div className="mt-4">
        <SegmentManager
          {...this.props}
          loading={this.state.searching}
          predicates={this.props.data.segments}
          meta={this.state.meta}
          collection={this.state.app_users}
          updatePredicate={this.updatePredicate.bind(this)}
          addPredicate={this.addPredicate.bind(this)}
          deletePredicate={this.deletePredicate.bind(this)}
          search={this.search.bind(this)}
          loading={this.props.searching}
          columns={userFormat(this.showUserDrawer, this.props.app)}
          defaultHiddenColumnNames={[
            'id',
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
          // selection [],
          tableColumnExtensions={[
            // { columnName: 'id', width: 150 },
            { columnName: 'email', width: 250 },
            { columnName: 'lastVisitedAt', width: 120 },
            { columnName: 'os', width: 100 },
            { columnName: 'osVersion', width: 100 },
            { columnName: 'state', width: 80 },
            { columnName: 'online', width: 80 }
            // { columnName: 'amount', align: 'right', width: 140 },
          ]}
          leftColumns={['email']}
          rightColumns={['online']}
          // toggleMapView={this.toggleMapView}
          // map_view={this.state.map_view}
          // enableMapView={true}
        >
          {this.state.jwt ? (
            <Button
              isLoading={false}
              variant={'icon'}
              size={'small'}
              onClick={this.handleSave}
            >
              <i className="fas fa-chart-pie"></i> Save Segment
            </Button>
          ) : null}
        </SegmentManager>
      </div>
    )
  }
}

class CampaignForm extends Component {
  constructor (props) {
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
  };

  componentDidMount () {
    this.fetchCampaign()
  }

  componentDidUpdate (prevProps, _prevState) {
    if (this.props.campaigns.campaign === this.state.data.id &&
      this.props.campaigns.ts !== prevProps.campaigns.ts) {
      this.fetchCampaign()
    }
  }

  deleteCampaign = (cb) => {
    graphql(
      DELETE_CAMPAIGN,
      {
        appKey: this.props.app.key,
        id: this.state.data.id
      },
      {
        success: (data) => {
          console.log(data)
          cb && cb()
        },
        error: (error) => {
          console.log(error)
        }
      }
    )
  };

  fetchCampaign = (cb) => {
    const id = this.props.match.params.id

    if (id === 'new') {
      graphql(
        CREATE_CAMPAIGN,
        {
          appKey: this.props.app.key,
          mode: this.props.mode,
          operation: 'new',
          campaignParams: {}
        },
        {
          success: (data) => {
            this.setState(
              {
                data: data.campaignCreate.campaign
              },
              cb && cb
            )
          }
        }
      )
    } else {
      graphql(
        CAMPAIGN,
        {
          appKey: this.props.app.key,
          mode: this.props.mode,
          id: id
        },
        {
          success: (data) => {
            this.setState(
              {
                data: data.app.campaign
              },
              cb && cb
            )
          }
        }
      )
    }
  };

  updateData = (data, cb) => {
    this.setState({ data: data }, cb && cb())
  };

  renderEditorForCampaign = () => {
    switch (this.props.mode) {
      case 'tours':
        return (
          <TourManager
            {...this.props}
            url={this.url()}
            updateData={this.updateData}
            data={this.state.data}
          />
        )
      default:
        return (
          <CampaignEditor
            {...this.props}
            url={this.url()}
            updateData={this.updateData}
            data={this.state.data}
          />
        )
    }
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i })
  };

  tabsContent = () => {
    return (
      <Tabs
        value={this.state.tabValue}
        onChange={this.handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: 'Stats',
            content: (
              <CampaignStats
                {...this.props}
                url={this.url()}
                data={this.state.data}
                fetchCampaign={this.fetchCampaign}
                updateData={this.updateData}
                getStats={this.getStats}
              />
            )
          },
          {
            label: 'Settings',
            content: (
              <CampaignSettings
                {...this.props}
                data={this.state.data}
                mode={this.props.mode}
                successMessage={() =>
                  this.props.dispatch(successMessage('campaign updated'))
                }
                url={this.url()}
                updateData={this.updateData}
              />
            )
          },
          {
            label: 'Audience',
            content: (
              <CampaignSegment
                {...this.props}
                data={this.state.data}
                url={this.url()}
                successMessage={() =>
                  this.props.dispatch(successMessage('campaign updated'))
                }
                updateData={this.updateData}
              />
            )
          },
          { label: 'Editor', content: this.renderEditorForCampaign() }
        ]}
      ></Tabs>
    )
  };

  getStats = (params, cb) => {
    graphql(CAMPAIGN_METRICS, params, {
      success: (data) => {
        const d = data.app.campaign
        cb(d)
      },
      error: (_error) => {}
    })
  };

  isNew = () => {
    return this.props.match.params.id === 'new'
  };

  handleSend = (_e) => {
    const params = {
      appKey: this.props.app.key,
      id: this.state.data.id
    }

    graphql(DELIVER_CAMPAIGN, params, {
      success: (data) => {
        this.updateData(data.campaignDeliver.campaign, null)
        // this.setState({ status: "saved" })
      },
      error: () => {}
    })
  };

  cloneCampaign = (_e) => {
    const params = {
      appKey: this.props.app.key,
      id: `${this.state.data.id}`
    }

    graphql(CLONE_MESSAGE, params, {
      success: (_data) => {
        this.props.dispatch(successMessage(
          'cloned successfully'
        ))

        this.props.init()
      },
      error: () => {
        this.props.dispatch(errorMessage(
          'error while cloning record'
        ))
      }
    })
  }

  campaignName = (name) => {
    switch (name) {
      case 'campaigns':
        return 'Mailing Campaign'
      case 'user_auto_messages':
        return 'In app messages'
      default:
        return name
    }
  };

  options = () => ([
    {
      title: 'Pause',
      description: 'pauses the campaign ',
      icon: <Pause />,
      id: 'disabled',
      state: 'disabled',
      onClick: this.toggleCampaignState
    },
    {
      title: 'Clone',
      description: 'clones the campaign',
      icon: <CopyContentIcon />,
      id: 'enabled',
      state: 'enabled',
      onClick: this.cloneCampaign
    }
  ])

  toggleCampaignState = () => {
    graphql(
      UPDATE_CAMPAIGN,
      {
        appKey: this.props.app.key,
        id: this.state.data.id,
        campaignParams: {
          state: this.state.data.state === 'enabled' ? 'disabled' : 'enabled'
        }
      },
      {
        success: (data) => {
          this.setState({
            data: data.campaignUpdate.campaign
          })
          this.props.dispatch(successMessage(
            I18n.t('campaigns.campaign_updated')
          ))
        },
        error: () => {
          this.props.dispatch(errorMessage(
            I18n.t('campaigns.updated_error')
          ))
        }
      }
    )
  };

  iconMode = (name) => {
    switch (name) {
      case 'campaigns':
        return <EmailIcon />
      case 'user_auto_messages':
        return <MessageIcon />
      case 'tours':
        return <FilterFramesIcon />
      default:
        return name
    }
  };

  optionsForMailing = () => {
    return [
      /* {
        title: "Preview",
        description: "preview campaign's message",
        icon: <VisibilityRounded />,
        id: "preview",
        onClick: (e) => {
          window.open(
            `${window.location.origin}/apps/${this.props.app.key}/premailer/${this.state.data.id}`,
            "_blank"
          );
        },
      }, */
      {
        title: I18n.t('campaigns.deliver_title'),
        description: I18n.t('campaigns.deliver_description'),
        icon: <SendIcon />,
        id: 'deliver',
        onClick: this.handleSend
      }
    ]
  };

  deleteOption = () => {
    return {
      title: I18n.t('common.delete'),
      description: I18n.t('campaigns.delete_campaign', { name: this.state.data.name }),
      icon: <DeleteOutlineRounded />,
      id: 'delete',
      onClick: this.openDeleteDialog
    }
  };

  optionsForData = () => {
    let newOptions = this.options()
    if (this.props.mode === 'campaigns') {
      newOptions = this.optionsForMailing().concat(this.options())
    }

    newOptions = newOptions.filter((o) => o.state !== this.state.data.state)

    newOptions = newOptions.concat(this.purgeMetricsOptions())

    newOptions.push(this.deleteOption())

    return newOptions
  };

  purgeMetricsOptions = () => {
    return {
      title: I18n.t('campaigns.purge_title'),
      description: I18n.t('campaigns.purge_description'),
      icon: <ClearAll />,
      id: 'deliver',
      onClick: this.purgeMetrics
    }
  };

  openDeleteDialog = () => {
    this.setState({
      deleteDialog: true
    })
  };

  purgeMetrics = () => {
    graphql(
      PURGE_METRICS,
      {
        appKey: this.props.app.key,
        id: parseInt(this.props.match.params.id)
      },
      {
        success: (_data) => {
          this.fetchCampaign(() => {
            this.props.dispatch(successMessage('campaign updated'))
          })
        },
        error: () => {
          this.props.dispatch(errorMessage('error purging metrics'))
        }
      }
    )
  };

  render () {
    const badgeClass = this.state.data.state === 'enabled' ? 'green' : 'gray'

    const title = this.state.data.name
      ? `${this.state.data.name}`
      : this.campaignName(this.props.mode)

    return (
      <div>
        {this.state.deleteDialog && (
          <DeleteDialog
            open={this.state.deleteDialog}
            title={I18n.t('campaigns.delete_campaign', { name: title })}
            deleteHandler={() => {
              this.deleteCampaign(() => {
                this.setState(
                  {
                    deleteDialog: false
                  },
                  () => {
                    this.props.history.push(
                      `/apps/${this.props.app.key}/messages/${this.props.mode}`
                    )
                  }
                )
              })
            }}
          >
            <p variant="subtitle2">
              {I18n.t('campaigns.remove_hint')}
            </p>
          </DeleteDialog>
        )}

        <Content>
          <ContentHeader
            title={
              <div className="justify-around items-center">

                <div className="flex items-center">
                  <div className="mr-2">
                    <div
                      className=""
                      color={
                        this.state.data.state === 'enabled'
                          ? 'primary'
                          : 'secondary'
                      }
                      variant="dot"
                    >
                      {this.iconMode(this.props.mode)}
                    </div>
                  </div>

                  {title}
                  <span
                    className={`ml-2 px-2 
                        inline-flex 
                        text-xs 
                        leading-5 
                        font-semibold 
                        rounded-full 
                        bg-${badgeClass}-100 
                        text-${badgeClass}-800`}
                  >
                    {this.state.data.state}
                  </span>
                </div>
              </div>
            }
            actions={
              <React.Fragment>
                <div className="flex">
                  {
                    this.props.match.params.id !== 'new' &&

                  <UpgradeButton
                    classes={
                      `
                      absolute z-10 ml-1 mt-3 transform w-screen 
                      max-w-md px-2 origin-top-right right-0
                      md:-ml-4 sm:px-0 lg:ml-0
                      lg:right-2/6 lg:translate-x-1/6`
                    }
                    label="Activate Campaigns"
                    feature="Campaigns">

                    <Button
                      className="mr-2"
                      title= "Enable"
                      description={
                        this.state.data.state === 'disabled'
                          ? 'enables the campaign'
                          : 'disables the campaign'
                      }
                      // icon= <CheckCircle />
                      id="enabled"
                      state="enabled"
                      onClick={this.toggleCampaignState}
                    >
                      {
                        this.state.data.state === 'disabled'
                          ? 'Enable'
                          : 'Disable'
                      }

                    </Button>
                  </UpgradeButton>
                  }

                  {
                    this.props.match.params.id !== 'new' &&
                  <FilterMenu
                    options={this.optionsForData()}
                    value={'Actions'}
                    filterHandler={(option, _closeHandler) => {
                      return (option.onClick && option.onClick(option))
                    }}
                    triggerButton={this.toggleButton}
                    position={'right'}
                    toggleButton={(clickHandler) => {
                      return (
                        <Button
                          onClick={clickHandler}
                          variant="outlined"
                          color="inherit"
                          size="small"
                        >
                          {'actions'}
                        </Button>
                      )
                    }}
                  />
                  }
                </div>
              </React.Fragment>
            }
          />

          {!isEmpty(this.state.data) ? (
            this.isNew() ? (
              <CampaignSettings
                {...this.props}
                data={this.state.data}
                mode={this.props.mode}
                url={this.url()}
                updateData={this.updateData}
                successMessage={() =>
                  this.props.dispatch(successMessage('campaign updated'))
                }
              />
            ) : (
              this.tabsContent()
            )
          ) : null}
        </Content>
      </div>
    )
  }
}

class CampaignContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      campaigns: [],
      meta: {},
      openDeleteDialog: null
    }
  }

  componentDidUpdate (prevProps, _prevState) {
    if (
      this.props.match.params.message_type !==
      prevProps.match.params.message_type
    ) {
      this.init()

      this.props.dispatch(setCurrentPage(this.props.match.params.message_type))

      this.props.dispatch(setCurrentSection('Campaigns'))
    }
  }

  componentDidMount () {
    this.props.dispatch(setCurrentSection('Campaigns'))

    this.props.dispatch(setCurrentPage(this.props.match.params.message_type))

    this.init()
  }

  init = (page) => {
    this.setState({
      loading: true
    })

    graphql(
      CAMPAIGNS,
      {
        appKey: this.props.app.key,
        mode: this.props.match.params.message_type,
        page: page || 1
      },
      {
        success: (data) => {
          const { collection, meta } = data.app.campaigns
          this.setState({
            campaigns: collection,
            meta: meta,
            loading: false
          })
        }
      }
    )
  };

  createNewCampaign = (_e) => {
    this.props.history.push(`${this.props.match.url}/new`)
  };

  handleRowClick = (_a, data, _c) => {
    const row = this.state.campaigns[data.dataIndex]
    this.props.history.push(`${this.props.match.url}/${row.id}`)
  };

  renderActions = () => {
    return (
      <div>
        <Button
          color={'primary'}
          onClick={this.createNewCampaign}
          variant="flat-dark"
        >
          {I18n.t('campaigns.create_new')}
        </Button>
      </div>
    )
  };

  deleteCampaign = (id, cb) => {
    graphql(
      DELETE_CAMPAIGN,
      {
        appKey: this.props.app.key,
        id: id
      },
      {
        success: (data) => {
          console.log(data)
          cb && cb()
        },
        error: (error) => {
          console.log(error)
        }
      }
    )
  };

  render () {
    return (
      <div className="m-4">
        <Switch>
          <Route
            exact
            path={`${this.props.match.url}/:id`}
            render={(props) => (
              <CampaignForm
                currentUser={this.props.currentUser}
                mode={this.props.match.params.message_type}
                init={this.init}
                {...this.props}
                {...props}
              />
            )}
          />

          <Route
            exact
            path={`${this.props.match.url}`}
            render={(_props) => (
              <div>
                {this.state.openDeleteDialog && (
                  <DeleteDialog
                    open={this.state.openDeleteDialog}
                    title={
                      I18n.t('campaigns.delete_campaign', { name: this.state.openDeleteDialog.name })
                    }
                    closeHandler={() => {
                      this.setState({ openDeleteDialog: null })
                    }}
                    deleteHandler={() => {
                      this.deleteCampaign(
                        this.state.openDeleteDialog.id,
                        () => {
                          this.init()
                          this.setState({ openDeleteDialog: null })
                          this.props.dispatch(
                            successMessage(
                              I18n.t('campaigns.remove_success')
                            )
                          )
                        }
                      )
                    }}
                  >
                    <p variant="subtitle2">
                      {I18n.t('campaigns.remove_hint')}
                    </p>
                  </DeleteDialog>
                )}

                <ContentHeader
                  title={I18n.t('campaigns.home.title')}
                  actions={this.renderActions()}
                />

                <Content>
                  {!this.state.loading && this.state.campaigns.length > 0 && (
                    <Table
                      meta={this.state.meta}
                      data={this.state.campaigns}
                      title={I18n.t('campaigns.title')}
                      // title={`${this.props.match.params.message_type} campaign`}
                      defaultHiddenColumnNames={[]}
                      search={this.init.bind(this)}
                      columns={[
                        {
                          field: 'name',
                          title: I18n.t('definitions.campaigns.campaign_name.label'),
                          render: (row) =>
                            row && (
                              <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                <div className="flex items-center">
                                  <div className="text-lg leading-5 font-bold text-gray-900">
                                    <AnchorLink
                                      to={`${this.props.match.url}/${row.id}`}
                                    >
                                      {row.name}
                                    </AnchorLink>
                                  </div>
                                </div>
                              </td>
                            )
                        },
                        { field: 'subject', title: I18n.t('definitions.campaigns.email_subject.label') },
                        {
                          field: 'state',
                          title: I18n.t('definitions.campaigns.state.label'),
                          render: (row) => {
                            return (
                              <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                <Badge variant={row.state === 'enabled' ? 'green' : null}>
                                  {row.state}
                                </Badge>
                              </td>
                            )
                          }
                        },
                        { field: 'fromName', title: I18n.t('definitions.campaigns.from_name.label'), hidden: true },
                        { field: 'fromEmail', title: I18n.t('definitions.campaigns.from_email.label'), hidden: true },
                        { field: 'replyEmail', title: I18n.t('definitions.campaigns.reply_email.label'), hidden: true },
                        { field: 'description', title: I18n.t('definitions.campaigns.description.label'), hidden: true },
                        { field: 'timezone', title: 'timezone' },
                        {
                          field: 'scheduledAt',
                          title: I18n.t('definitions.campaigns.scheduled_at.label'),
                          hidden: true,
                          type: 'datetime',
                          render: row => (row
                            ? <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                              <Moment fromNow>
                                {row.scheduledAt}
                              </Moment>
                            </td> : undefined)
                        },
                        {
                          field: 'scheduledTo',
                          title: I18n.t('definitions.campaigns.scheduled_to.label'),
                          hidden: true,
                          type: 'datetime',
                          render: row => (row
                            ? <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                              <Moment fromNow>
                                {row.scheduledTo}
                              </Moment>
                            </td> : undefined)
                        },
                        {
                          field: 'actions',
                          title: I18n.t('definitions.campaigns.actions.label'),
                          render: (row) => (
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                              <span
                                className={'px-2 inline-flex text-xs leading-5 font-semibold rounded-full '}
                              >
                                <Button
                                  color={'secondary'}
                                  variant={'danger'}
                                  onClick={() =>
                                    this.setState({ openDeleteDialog: row })
                                  }>
                                  {I18n.t('common.remove')}
                                </Button>
                              </span>
                            </td>
                          )
                        }
                      ]}
                    ></Table>
                  )}

                  {!this.state.loading && this.state.campaigns.length === 0 ? (
                    <EmptyView
                      title={I18n.t('campaigns.empty.title')}
                      subtitle={
                        <div>
                          {this.renderActions()}
                        </div>
                      }
                    />
                  ) : null}

                  {this.state.loading ? <CircularProgress /> : null}
                </Content>
              </div>
            )}
          />
        </Switch>
      </div>
    )
  }
}

function mapStateToProps (state) {
  const { auth, app, campaigns } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated,
    campaigns
  }
}

export default withRouter(connect(mapStateToProps)(CampaignContainer))
