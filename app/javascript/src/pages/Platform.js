import React from 'react'

import PageHeader from '../components/PageHeader'
import Content from '../components/Content'
import ContactManager from '../components/ContactManager'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { setCurrentPage, setCurrentSection } from '../actions/navigation'
import {
  dispatchSegmentUpdate,
  fetchAppSegment,
  updateSegment,
  createSegment,
  deleteSegment,
  addPredicate,
  updatePredicate,
  deletePredicate
} from '../actions/segments'
import { searchAppUsers } from '../actions/app_users'

import { setApp } from '../actions/app'

import AppContent from '../components/segmentManager/container'

// <PageContainer>jiiojioj</PageContainer>

function Platform ({
  dispatch,
  match,
  app,
  app_users,
  segment
}) {
  React.useEffect(() => {
    dispatch(setCurrentSection('Platform'))

    dispatch(setCurrentPage(`segment-${match.params.segmentID}`))

    dispatch(
      dispatchSegmentUpdate({
        id: match.params.segmentID,
        jwt: match.params.Jwt
      })
    )

    getSegment(() => {
      search()
    })
  }, [match.params.segmentID, match.params.Jwt])

  const search = (page) => {
    const options = {
      page: page || 1
    }

    dispatch(searchAppUsers(options, () => {}))
  }

  const fetchApp = () => {
    console.log('TODO: fetch app')

    dispatch(setApp(app.key))
  }

  const getSegment = () => {
    const segmentID = match.params.segmentID
    return segmentID ? fetchAppSegmentDispatch(segmentID) : null
  }

  const updateSegmentD = (data, cb) => {
    dispatch(updateSegment(segment.id, cb))
  }

  const createSegmentD = (data, cb) => {
    const params = {
      name: data.input
    }

    dispatch(
      createSegment(params, () => {
        cb && cb()
      })
    )
  }

  const deleteSegmentD = (id, cb) => {
    dispatch(
      deleteSegment(id, () => {
        cb && cb()
        fetchApp()
      })
    )
  }

  const addPredicateD = (data, cb) => {
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }
    dispatch(
      addPredicate(pending_predicate, (token) => {
        cb && cb(token)
      })
    )
  }

  const updatePredicateD = (data, cb) => {
    dispatch(
      updatePredicate(data, (token) => {
        cb && cb(token)
        // this.setState({jwt: token})
      })
    )
  }

  const fetchAppSegmentDispatch = (id) => {
    dispatch(fetchAppSegment(id, search))
  }

  const getPredicates = () => {
    return segment.predicates || []
  }

  const savePredicates = (data, cb) => {
    if (data.action === 'update') {
      updateSegmentD(data, () => {
        cb()
        fetchApp()
      })
    } else if (data.action === 'new') {
      createSegmentD(data, () => {
        cb()
        fetchApp()
      })
    }
  }

  const deletePredicateD = (data) => {
    dispatch(deletePredicate(data, () => updateSegment({}, fetchApp())))
  }

  return (
    <Content>
      <PageHeader
        title={segment && segment.name}
        actions={
          <ContactManager app={app}/>
        }
      />

      <div className="flex flex-col">
        <AppContent
          match={match}
          app_users={app_users}
          actions={{
            search: search,
            getPredicates: getPredicates,
            fetchAppSegment: fetchAppSegmentDispatch,
            updateSegment: updateSegmentD,
            createSegment: createSegmentD,
            deleteSegment: deleteSegmentD,
            addPredicate: addPredicateD,
            updatePredicate: updatePredicateD,
            savePredicates: savePredicates,
            deletePredicate: deletePredicateD
          }}
          // history={props.history}
          // actions={this.actions()}
        />
      </div>
    </Content>
  )
}

function mapStateToProps (state) {
  const { auth, app, segment, app_users, app_user } = state
  const { loading, isAuthenticated } = auth

  const { searching, meta } = app_users

  return {
    app_user,
    app_users,
    searching,
    meta,
    segment,
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Platform))
