import React from 'react'

import PageHeader from '../components/PageHeader'
import Content from '../components/Content'

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

import tw from 'twin.macro'

const PageContainer = tw.div`
  bg-gray-200 text-xl w-1/2
`

// <PageContainer>jiiojioj</PageContainer>

function Platform ({
  dispatch,
  match,
  searching,
  app,
  app_users,
  meta,
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
  }, [match.params.segmentID])

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
        const url = `/apps/${app.key}/segments/${segment.id}.json`
        // this.props.history.push(url)
        cb && cb()
      })
    )
  }

  const deleteSegmentD = (id, cb) => {
    dispatch(
      deleteSegment(id, () => {
        cb && cb()
        const url = `/apps/${app.key}`
        // this.props.history.push(url)
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
      <PageHeader title={segment && segment.name} />

      <div className="flex flex-col">
        {/* <button type="button" className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-50 focus:outline-none focus:border-indigo-300 focus:shadow-outline-indigo active:bg-indigo-200 transition ease-in-out duration-150">
              Button text
            </button>

            <button type="button" className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-50 focus:outline-none focus:border-indigo-300 focus:shadow-outline-indigo active:bg-indigo-200 transition ease-in-out duration-150">
              Button text
            </button>

            <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                {renderTable()}
              </div>
            </div> */}

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
