import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import Button from '@chaskiq/components/src/components/Button'
import SegmentManager from '@chaskiq/components/src/components/segmentManager'
import Input from '@chaskiq/components/src/components/forms/Input'
import userFormat from '@chaskiq/components/src/components/Table/userFormat'
import Hints from '@chaskiq/components/src/components/Hints'
import ButtonTabSwitch from '@chaskiq/components/src/components/ButtonTabSwitch'

import graphql from '@chaskiq/store/src/graphql/client'

import {
  parseJwt,
  generateJWT
} from '@chaskiq/store/src/jwt'

import {
  toggleDrawer
} from '@chaskiq/store/src/actions/drawer'

import {
  getAppUser
} from '@chaskiq/store/src/actions/app_user'

import { PREDICATES_SEARCH } from '@chaskiq/store/src/graphql/mutations'
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary'

function InboundSettings({ settings, update, dispatch }) {
  const options = [
    {
      name: I18n.t('common.users'),
      namespace: 'users',
      i18n: 'users',
      classes: 'rounded-l-lg',
    },
    {
      name: I18n.t('common.visitors'),
      namespace: 'visitors',
      i18n: 'leads',
      classes: 'rounded-r-lg',
    },
  ]

  const [option, setOption] = React.useState(options[0])

  const activeClass =
    'bg-indigo-600 text-gray-100 border-indigo-600 pointer-events-none'

  function handleClick(o) {
    setOption(o)
  }

  return (
  <div className="flex flex-col">
    <div className="inline-flex mt-4">
      <ButtonTabSwitch 
        options={options} 
        option={option} 
        handleClick={handleClick} 
      />
    </div>

    <ErrorBoundary variant="very-wrong">
      <InboundSettingsForm
        option={option}
        settings={settings}
        update={update}
        dispatch={dispatch}
      />
    </ErrorBoundary>

  </div>
  )

}

function RepliesClosedConversationsControls({kind, option, handleChangeNumber, state}){
  const afterKind = `${kind}_after`
  const enabledKind = `${kind}_enabled`

  const enabledValue = state[enabledKind]
  return (

    <div>
      <p className="text-lg leading-5 font-bold text-gray-900 pb-2">
        {I18n.t('settings.inbound.closed_replies_title', {name: option.name})}
      </p>

      <div className="flex items-center space-x-1 h-24 py-3">
        <Input
          type="checkbox"
          checked={enabledValue}
          defaultValue={enabledValue}
          onChange={(e) => {
              handleChangeNumber(
                enabledKind, 
                e.currentTarget.checked
              )
            }
          }
          value={enabledValue}
          color="primary"
          label={
            !enabledValue ?
            I18n.t('settings.inbound.closed_replies_enabled') :
            I18n.t('settings.inbound.closed_replies_disabled')
          }
        />

        { 
          enabledValue && 
          <div className="w-[10em]">
            <Input
              type="number"
              onChange={(e) => {
                const num = parseInt(e.currentTarget.value)
                if(num < 0) return
                handleChangeNumber(
                  afterKind, num
                  )
                }
              }
              value={state[afterKind]}
              className="flex flex-row-reverse space-x-2"
              labelMargin={'mx-3 py-2'}
              color="primary"
              label={
                I18n.t('common.days')
              }
              />          
          </div>
        }
      </div>
    </div>
  )

}

function InboundSettingsForm({ settings, update, dispatch, option }) {
  const [state, setState] = React.useState({
    enable_inbound: settings.inboundSettings.enabled,

    user_enable_inbound: settings.inboundSettings.enabled,
    users_radio: settings.inboundSettings.users.segment,
    users_enabled: settings.inboundSettings.users.enabled,
    users_predicates: settings.inboundSettings.users.predicates,
    users_close_conversations_enabled: settings.inboundSettings.users.close_conversations_enabled,
    users_close_conversations_after: settings.inboundSettings.users.close_conversations_after || 0,

    visitors_enable_inbound: settings.inboundSettings.enabled,
    visitors_radio: settings.inboundSettings.visitors.segment,
    visitors_enabled: settings.inboundSettings.visitors.enabled,
    visitors_predicates: settings.inboundSettings.visitors.predicates,
    visitors_close_conversations_enabled: settings.inboundSettings.visitors.close_conversations_enabled,
    visitors_close_conversations_after: settings.inboundSettings.visitors.close_conversations_after || 0
  })

  const handleChange = (name, event) => {
    setState({ ...state, [name]: event.target.checked })
  }

  const handleChangeNumber = (name, val) => {
    setState({ ...state, [name]: val })
  }

  function setPredicates(name, value) {
    setState({ ...state, [name]: value })
  }

  function handleSubmit() {
    const {
      enable_inbound,
      visitors_enable_inbound,
      users_enable_inbound,
      users_enabled,
      users_radio,
      users_predicates,
      visitors_radio,
      visitors_enabled,
      visitors_predicates,
      visitors_close_conversations_after,
      visitors_close_conversations_enabled,
      users_close_conversations_after,
      users_close_conversations_enabled
    } = state

    const data = {
      app: {
        inbound_settings: {
          enabled: enable_inbound,
          users: {
            users_enable_inbound: users_enable_inbound,
            enabled: users_enabled,
            segment: users_radio,
            predicates: users_predicates,
            close_conversations_enabled: users_close_conversations_enabled,
            close_conversations_after: users_close_conversations_after
          },
          visitors: {
            visitors_enable_inbound: visitors_enable_inbound,
            enabled: visitors_enabled,
            segment: visitors_radio,
            predicates: visitors_predicates,
            close_conversations_enabled: visitors_close_conversations_enabled,
            close_conversations_after: visitors_close_conversations_after
          },
        },
      },
    }
    update(data)
  }

  return (
    <div>
      <div className="py-4">
        <Hints type="inbound_settings" />
      </div>

      <p className="text-lg font-bold text-gray-900 pb-2">
        {I18n.t('settings.inbound.title')}
      </p>

      <div>
        <Input
          type="checkbox"
          checked={state.enable_inbound}
          onChange={(e) => handleChange('enable_inbound', e)}
          value={state.enable_inbound}
          color="primary"
          label={I18n.t('settings.inbound.checkbox')}
        />
      </div>

      <p className="my-2 max-w-xl text-sm leading-5 text-gray-500">
        {I18n.t('settings.inbound.hint')}
      </p>

      <hr />

      <div className="py-4">
        <p className="text-lg leading-5 font-bold text-gray-900 dark:text-gray-100 pb-2">
          {I18n.t('settings.inbound.title2')}
        </p>
      </div>

      <RepliesClosedConversationsControls 
        state={state}
        option={option}
        kind={`${option.namespace}_close_conversations`}
        handleChangeNumber={handleChangeNumber}
      />

      <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-2">
        {I18n.t('settings.inbound.hint2')}
      </p>

      <p className="text-sm leading-4 font-light text-gray-800 dark:text-gray-300 pb-2">
        {I18n.t('settings.inbound.note2')}
      </p>

      <div className="py-4">
        <p className="py-2">{I18n.t('settings.inbound.note3')}</p>
        <hr />
        <AppSegmentManager
          app={settings}
          label={I18n.t(`settings.inbound.filters.${option.i18n}.label`)}
          namespace={option.namespace}
          all={I18n.t(`settings.inbound.filters.${option.i18n}.all`)}
          checked={state[`${option.namespace}_enabled`]}
          updateChecked={handleChange}
          predicates={state[`${option.namespace}Predicates`] || []}
          setPredicates={setPredicates}
          radioValue={state[`${option.namespace}_radio`]}
          dispatch={dispatch}
          some={I18n.t(`settings.inbound.filters.${option.i18n}.some`)}
        />
        <hr />
        <p className="text-sm leading-6 font-medium text-gray-400 pb-2">
          {I18n.t('settings.inbound.filters.hint')}
        </p>
      </div>

      <div className="pb-4">
        <Button
          onClick={handleSubmit}
          variant={'success'}
          size="md"
          color={'primary'}
        >
          {I18n.t('common.save')}
        </Button>
      </div>

    </div>
  )
}

function mapStateToProps(state) {
  const { drawer } = state
  return {
    drawer,
  }
}

export default withRouter(connect(mapStateToProps)(InboundSettings))

function AppSegmentManager({
  app,
  all,
  some,
  checked,
  updateChecked,
  namespace,
  predicates,
  setPredicates,
  radioValue,
  dispatch,
}) {
  function handleChangeRadio(e) {
    setPredicates(`${namespace}_radio`, e.target.value)
  }

  function updatePredicates(data, cb) {
    setPredicates(`${namespace}Predicates`, data.segments)
    cb && cb()
  }

  return (
    <div className="py-6">
      <div className="flex">
        <div className="w-1/2">
          <Input
            type="checkbox"
            checked={checked}
            defaultChecked={checked}
            onChange={(e) => updateChecked(`${namespace}_enabled`, e)}
            value={checked}
            color="primary"
            label={namespace}
          />
        </div>

        <div className="w-1/2">
          <Input
            type="radio"
            name={`${namespace}_options[]`}
            checked={radioValue === 'all'}
            disabled={!checked}
            defaultChecked={radioValue === 'all'}
            onChange={handleChangeRadio}
            value="all"
            label={all}
          />

          <Input
            type="radio"
            name={`${namespace}_options[]`}
            checked={radioValue === 'some'}
            disabled={!checked}
            defaultChecked={radioValue === 'some'}
            onChange={handleChangeRadio}
            value="some"
            label={some}
          />
        </div>
      </div>

      <div className="w-full">
        {checked && radioValue === 'some' ? (
          <AppSegment
            app={app}
            data={{ segments: predicates }}
            updateData={updatePredicates}
            dispatch={dispatch}
          />
        ) : null}
      </div>
    </div>
  )
}

class AppSegment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      jwt: null,
      app_users: [],
      search: false,
      meta: {},
    }
  }

  componentDidMount() {
    /* this.props.actions.fetchAppSegment(
      this.props.app.segments[0].id
    ) */

    this.search()
  }

  updateData = (data, cb) => {
    const newData = Object.assign({}, this.props.data, {
      segments: data.data,
    })
    this.props.updateData(newData, cb ? cb() : null)
  }

  updatePredicate = (data, cb) => {
    const jwtToken = generateJWT(data)
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken)
    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt), this.search)
    )
  }

  addPredicate = (data, cb) => {
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value,
    }

    const new_predicates = this.props.data.segments.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken)

    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt))
    )
  }

  deletePredicate(data) {
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
        predicates: data.filter((o) => o.comparison),
      },
    }

    graphql(
      PREDICATES_SEARCH,
      {
        appKey: this.props.app.key,
        search: predicates_data,
        page: page || 1,
        per: 5,
      },
      {
        success: (data) => {
          const appUsers = data.predicatesSearch.appUsers
          this.setState({
            app_users: appUsers.collection,
            meta: appUsers.meta,
            searching: false,
          })
        },
        error: (_error) => {},
      }
    )
  }

  showUserDrawer = (o) => {
    this.props.dispatch(
      toggleDrawer({ userDrawer: true }, () => {
        this.props.dispatch(getAppUser(o.id))
      })
    )
  }

  render() {
    return (
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
          'lang',
        ]}
        // selection [],
        tableColumnExtensions={[
          // { columnName: 'id', width: 150 },
          { columnName: 'email', width: 250 },
          { columnName: 'lastVisitedAt', width: 120 },
          { columnName: 'os', width: 100 },
          { columnName: 'osVersion', width: 100 },
          { columnName: 'state', width: 80 },
          { columnName: 'online', width: 80 },
          // { columnName: 'amount', align: 'right', width: 140 },
        ]}
        leftColumns={['email']}
        rightColumns={['online']}
        // toggleMapView={this.toggleMapView}
        // map_view={this.state.map_view}
        // enableMapView={true}
      >
        {/*
        this.state.jwt ?
          <Button isLoading={false}
            appearance={'link'}
            onClick={this.handleSave}>
            <i className="fas fa-chart-pie"></i>
            {" "}
            Save Segment
          </Button> : null
      */}
      </SegmentManager>
    )
  }
}
