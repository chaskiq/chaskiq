import React, { Component } from 'react'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'


import SegmentManager from '@chaskiq/components/src/components/segmentManager'
import Button from '@chaskiq/components/src/components/Button'
import userFormat from '@chaskiq/components/src/components/Table/userFormat'

import graphql from '@chaskiq/store/src/graphql/client'

import {
  toggleDrawer
} from '@chaskiq/store/src/actions/drawer'

import {
  getAppUser
} from '@chaskiq/store/src/actions/app_user'

import {
  parseJwt, generateJWT
} from '@chaskiq/store/src/jwt'


import { PREDICATES_SEARCH } from '@chaskiq/store/src/graphql/mutations'
class Segment extends Component {
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
    this.search()
  }

  handleSave = (_e) => {
    const predicates = parseJwt(this.state.jwt)
    if (this.props.handleSave) {
      this.props.handleSave(predicates.data, () => {
        this.setState({ jwt: null })
      })
    }
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
    this.setState({ jwt: jwtToken }, () => {
      this.updateData(parseJwt(this.state.jwt), this.search)
    })
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
      <div className="py-4">
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
          tableColumnExtensions={[
            { columnName: 'email', width: 250 },
            { columnName: 'lastVisitedAt', width: 120 },
            { columnName: 'os', width: 100 },
            { columnName: 'osVersion', width: 100 },
            { columnName: 'state', width: 80 },
            { columnName: 'online', width: 80 },
          ]}
          leftColumns={['email']}
          rightColumns={['online']}
        >
          {this.state.jwt ? (
            <Button
              isLoading={false}
              size={'sm'}
              variant={'link'}
              onClick={this.handleSave}
              className="animate-pulse"
            >
              <i className="fas fa-exclamation-circle mr-2"></i>
              {I18n.t('common.save_changes')}
            </Button>
          ) : null}
        </SegmentManager>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { drawer } = state
  return {
    drawer,
  }
}

export default withRouter(connect(mapStateToProps)(Segment))
