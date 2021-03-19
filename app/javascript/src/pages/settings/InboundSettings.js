import React, { Component } from 'react'

import Button from '../../components/Button'

import SegmentManager from '../../components/segmentManager'
import { parseJwt, generateJWT } from '../../components/segmentManager/jwt'
import { PREDICATES_SEARCH } from '../../graphql/mutations'
import graphql from '../../graphql/client'
import userFormat from '../../components/Table/userFormat'
import { toggleDrawer } from '../../actions/drawer'
import { getAppUser } from '../../actions/app_user'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Input from '../../components/forms/Input'
import Hints from '../../shared/Hints'

function InboundSettings ({ settings, update, dispatch }) {
  const [state, setState] = React.useState({
    enable_inbound: settings.inboundSettings.enabled,

    users_radio: settings.inboundSettings.users.segment,
    users_enabled: settings.inboundSettings.users.enabled,
    usersPredicates: settings.inboundSettings.users.predicates,

    visitors_radio: settings.inboundSettings.visitors.segment,
    visitors_enabled: settings.inboundSettings.visitors.enabled,
    visitorsPredicates: settings.inboundSettings.visitors.predicates
  })

  const handleChange = (name, event) => {
    setState({ ...state, [name]: event.target.checked })
  }

  function setPredicates (name, value) {
    setState({ ...state, [name]: value })
  }

  function handleSubmit () {
    const {
      enable_inbound,
      users_enabled,
      users_radio,
      usersPredicates,
      visitors_radio,
      visitors_enabled,
      visitorsPredicates
    } = state

    const data = {
      app: {
        inbound_settings: {
          enabled: enable_inbound,
          users: {
            enabled: users_enabled,
            segment: users_radio,
            predicates: usersPredicates
          },
          visitors: {
            enabled: visitors_enabled,
            segment: visitors_radio,
            predicates: visitorsPredicates
          }
        }
      }
    }
    update(data)
  }

  return (
    <div>
      <div className="py-4">

        <Hints type="inbound_settings"/>

      </div>

      <p className="text-lg leading-5 font-medium text-gray-900 pb-2">
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
        <p className="text-lg leading-5 font-medium text-gray-900 pb-2">
          {I18n.t('settings.inbound.title2')}
        </p>
      </div>

      <p className="text-lg leading-6 font-medium text-gray-900 pb-2">
        {I18n.t('settings.inbound.hint2')}
      </p>

      <p className="text-md leading-6 font-medium text-gray-600 pb-2">
        {I18n.t('settings.inbound.note2')}
      </p>

      <div className="py-4">
        <p className="py-2">
          {I18n.t('settings.inbound.note3')}
        </p>

        <hr />

        <AppSegmentManager
          app={settings}
          label={I18n.t('settings.inbound.filters.users.label')}
          namespace={'users'}
          all={I18n.t('settings.inbound.filters.users.all')}
          checked={state.users_enabled}
          updateChecked={handleChange}
          predicates={state.usersPredicates || []}
          setPredicates={setPredicates}
          radioValue={state.users_radio}
          dispatch={dispatch}
          some={I18n.t('settings.inbound.filters.users.some')}
        />

        <hr />

        <AppSegmentManager
          app={settings}
          label={I18n.t('settings.inbound.filters.leads.label')}
          all={I18n.t('settings.inbound.filters.leads.all')}
          namespace="visitors"
          dispatch={dispatch}
          checked={state.visitors_enabled}
          updateChecked={handleChange}
          predicates={state.visitorsPredicates || []}
          setPredicates={setPredicates}
          radioValue={state.visitors_radio}
          some={I18n.t('settings.inbound.filters.leads.some')}
        />

        <p className="text-sm leading-6 font-medium text-gray-400 pb-2">
          { I18n.t('settings.inbound.filters.hint')}
        </p>
      </div>

      <div className="pb-4">
        <Button
          onClick={handleSubmit}
          variant={'success'}
          size="md"
          color={'primary'}>
          {I18n.t('common.save')}
        </Button>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  const { drawer } = state
  return {
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(InboundSettings))

function AppSegmentManager ({
  app,
  all,
  some,
  checked,
  updateChecked,
  namespace,
  predicates,
  setPredicates,
  radioValue,
  dispatch
}) {
  // const [checked, setChecked]= useState(checked)
  // const [radioValue, setRadioValue] = useState("all")
  // const [predicates, setPredicates] = useState([])

  /*function handleChange (e) {
    updateChecked(e)
    // setChecked(!checked)
  }*/

  function handleChangeRadio (e) {
    setPredicates(`${namespace}_radio`, e.target.value)
  }

  function updatePredicates (data, cb) {
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

  updateData = (data, cb) => {
    const newData = Object.assign({}, this.props.data, { segments: data.data })
    this.props.updateData(newData, cb ? cb() : null)
  };

  updatePredicate = (data, cb) => {
    const jwtToken = generateJWT(data)
    // console.log(parseJwt(jwtToken))
    if (cb) cb(jwtToken)
    this.setState({ jwt: jwtToken }, () =>
      this.updateData(parseJwt(this.state.jwt), this.search)
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
        page: page || 1,
        per: 5
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
      toggleDrawer({ rightDrawer: true }, () => {
        this.props.dispatch(getAppUser(o.id))
      })
    )
  };

  render () {
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
