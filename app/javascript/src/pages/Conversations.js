import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { setCurrentPage, setCurrentSection } from '../actions/navigation'
import {
  getConversations,
  updateConversationsData,
  clearConversations
} from '../actions/conversations'

import FilterMenu from '../components/FilterMenu'

import UserData from '../components/UserData'
import ConversationItemList from '../components/conversations/ItemList'
import AssignmentRules from '../components/conversations/AssignmentRules'
import Conversation from '../components/conversations/Conversation'
import Progress from '../components/Progress'
import EmptyView from '../components/EmptyView'
import Button from '../components/Button'
import emptyImage from '../images/empty-icon8.png'
import I18n from '../shared/FakeI18n'

import {
  LeftArrow
} from '../components/icons'
// import {toCamelCase} from '../shared/caseConverter'

function Conversations ({
  dispatch,
  match,
  conversations,
  conversation,
  app,
  events,
  app_user
}) {
  const [fetching, setFetching] = React.useState(false)
  const [fixedSidebarOpen, setFixedSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    dispatch(clearConversations([]))
    setFetching(true)
    fetchConversations({ page: 1 }, () => {
      setFetching(false)
    })

    dispatch(setCurrentPage('Conversations'))
    dispatch(setCurrentSection('Conversations'))
  }, [])

  const fetchConversations = (options, cb) => {
    dispatch(
      getConversations(options, () => {
        cb && cb()
      })
    )
  }

  const setSort = (option) => {
    dispatch(updateConversationsData({ sort: option }))
    this.setState({ sort: option })
  }

  const handleScroll = (e) => {
    const element = e.target
    const scrollDiff = Math.round(element.scrollHeight - element.scrollTop)
    if (scrollDiff === element.clientHeight) {
      if (conversations.meta.next_page && !fetching) {
        setFetching(true)
        fetchConversations({
          page: conversations.meta.next_page
        }, () => {
          setFetching(false)
        })
      }
    }
  }

  const setFilter = (option) => {
    dispatch(updateConversationsData({ filter: option }))
  }

  const filterButton = (handleClick) => {
    return (
      <Button
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        variant={'outlined'}
        onClick={handleClick}
        size="small"
      >
        {/* <MoreVertIcon /> */}
        {I18n.t('conversations.states.' + conversations.filter)}
      </Button>
    )
  }

  const sortButton = (handleClick) => {
    return (
      <Button
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        variant={'outlined'}
        onClick={handleClick}
        size="small"
      >
        {/* <MoreVertIcon /> */}
        {I18n.t('conversations.sorts.' + conversations.sort )}
      </Button>
    )
  }

  const filterConversations = (options, cb) => {
    dispatch(
      updateConversationsData(
        {
          filter: options.id,
          collection: []
        },
        () => {
          fetchConversations({ page: 1 }, cb)
          // getConversations({page: 1}, cb)
        }
      )
    )
  }

  const sortConversations = (options, cb) => {
    dispatch(
      updateConversationsData(
        {
          sort: options.id,
          collection: []
        },
        () => {
          fetchConversations({ page: 1 })
          // getConversations({page: 1}, cb)
        }
      )
    )
  }

  const renderConversations = () => {
    const filters = [
      { id: 'opened', name: I18n.t('conversations.states.opened'), count: 1, icon: null },
      { id: 'closed', name: I18n.t('conversations.states.closed'), count: 2, icon: null }
    ]

    const sorts = [
      { id: 'newest', name: I18n.t('conversations.sorts.newest'), count: 1, selected: true },
      { id: 'oldest', name: I18n.t('conversations.sorts.oldest'), count: 1 },
      { id: 'waiting', name: I18n.t('conversations.sorts.waiting'), count: 1 },
      { id: 'priority-first', name: I18n.t('conversations.sorts.priority_first'), count: 1 },
      { id: 'unfiltered', name: I18n.t('conversations.sorts.all'), count: 1 }
    ]

    return (
      <React.Fragment>

        <div className="bg-white px-3 py-3 border-b border-gray-200 sm:px-3 flex justify-between">
          <FilterMenu
            options={filters}
            value={conversations.filter}
            filterHandler={filterConversations}
            triggerButton={filterButton}
          />

          <FilterMenu
            options={sorts}
            position={'right'}
            value={conversations.sort}
            filterHandler={sortConversations}
            triggerButton={sortButton}
          />
        </div>

        <div className="overflow-scroll"
          onScroll={handleScroll}
          style={{ height: 'calc(100vh - 60px)' }}>
          {conversations.collection.map((o) => {
            const user = o.mainParticipant
            return (
              <ConversationItemList
                key={o.key}
                user={user}
                app={app}
                conversation={o}
              />
            )
          })}

          {
            fetching && <div className="m-2">
              <Progress size={
                conversations.collection.length === 0 ? '16' : '4'
              }/>
            </div>
          }
        </div>

      </React.Fragment>
    )
  }

  const toggleFixedSidebar = () => {
    setFixedSidebarOpen(!fixedSidebarOpen)
  }

  return (
    <div className="flex">

      <Switch>
        <Route exact path={`/apps/${app.key}/conversations`}>
          <div className={'w-full md:w-1/4 h-screen md:border-r sm:hidden'}>
            {renderConversations()}
          </div>
        </Route>
      </Switch>

      <div className={'w-full md:w-1/3 h-screen md:border-r hidden sm:block border-gray-200'}>
        {renderConversations()}
      </div>

      <Switch>
        <Route exact path={`/apps/${app.key}/conversations`}>
          <div className="hidden sm:block flex-grow bg-gray-50 h-12 h-screen border-r w-1/12">
            <EmptyView
              title={I18n.t('conversations.empty.title')}
              shadowless
              image={
                <img
                  src={emptyImage}
                  className="h-56 w-56"
                  alt={I18n.t('conversations.empty.title')}
                />
              }
              subtitle={I18n.t('conversations.empty.text')}
            />
          </div>
        </Route>

        <Route exact path={`/apps/${app.key}/conversations/assignment_rules`}>
          <div className="flex-grow bg-gray-50 h-12 h-screen border-r w-1/12">
            <AssignmentRules />
          </div>
        </Route>

        <Route exact path={`/apps/${app.key}/conversations/:id`}>
          <div className="flex-grow bg-gray-200 h-12 h-screen border-r w-1/12">
            <Conversation events={events}
              fixedSidebarOpen={fixedSidebarOpen}
              toggleFixedSidebar={toggleFixedSidebar}
            />
          </div>
        </Route>
      </Switch>

      {!isEmpty(conversation) && fixedSidebarOpen && (
        <div className="w-3/12 h-screen overflow-scroll hidden sm:block">

          {
            fixedSidebarOpen &&
              <div className="hidden md:block items-center text-gray-300 absolute mt-5">
                <Button
                  variant="clean"
                  onClick={ toggleFixedSidebar }>
                  <LeftArrow/>
                </Button>
              </div>
          }

          {app_user && app_user.id ? (
            <UserData
              data={conversation.mainParticipant}
            />
          ) : (
            <Progress />
          )}
        </div>
      )}
    </div>
  )
}

function mapStateToProps (state) {
  const { auth, app, conversations, conversation, app_user } = state
  const { loading, isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    conversations,
    conversation,
    app_user,
    app,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Conversations))
