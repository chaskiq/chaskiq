import React, { useEffect, useState } from 'react'
import graphql from '../../graphql/client'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Avatar from '../Avatar'

import {
  getConversations,
  updateConversationsData,
  clearConversations
} from '../../actions/conversations'

import {
  CONVERSATIONS_COUNTS
} from '../../graphql/queries'

function SidebarAgents ({ app, dispatch, conversations }) {
  const [counts, setCounts] = useState(null)
  const [agents, setAgents] = useState(null)

  useEffect(() => {
    getCounts()
  }, [])

  function getCounts () {
    graphql(CONVERSATIONS_COUNTS, { appKey: app.key }, {
      success: (data) => {
        setCounts(data.app.conversationsCounts)
        setAgents(data.app.agents)
      },
      error: () => {}
    })
  }

  function findAgent (o) {
    const agent = agents.find((a) => a.id === parseInt(o))
    if (agent) return agent
    return null
  }

  function fetchConversations (options, cb) {
    dispatch(
      getConversations(options, () => {
        cb && cb()
      })
    )
  }

  function filterAgent (option) {
    console.log('agent to filter', option)
    const agentID = option ? option.id : 0
    dispatch(clearConversations([]))
    dispatch(
      updateConversationsData({
        agentId: agentID,
        sort: 'unfiltered'
      }, () => {
        fetchConversations(
          {
            page: 1,
            agentId: agentID,
            sort: 'unfiltered',
            filter: 'opened'
          }
        )
      })
    )
  }

  return (
    <div>

      <div className="mt-4 flex items-center flex-shrink-0 px-4 text-md leading-6 font-bold text-gray-900">
        <h3 className="font-bold">
          Conversaciones
        </h3>
      </div>

      {
        counts && agents &&
        Object.keys(counts).map((o, i) => (
          <ListItem
            key={`agent-list-${i}`}
            agent={findAgent(o)}
            count={counts[o]}
            filterHandler={filterAgent}
            label={ o === 'all' ?
              'All conversations' : null
            }
          />
        ))
      }

      {/*
        <ListItem name="All conversations" count={798} />
        <ListItem name="Assigned to me" count={0} />
        <ListItem name="Unassigned" count={340} />
        <ListItem name="Bot" count={340} />
      */}

      {/*

        <div className="mt-4 flex items-center flex-shrink-0 px-4 text-md leading-6 font-bold text-gray-900">
          <h3 className="font-bold">Tags</h3>
        </div>

        <ListItem name="For sales" count={798} />
        <ListItem name="Support" count={0} /> 
      */}

    </div>
  )
}

function ListItem ({ agent, count, label, filterHandler }) {
  return (
    <a href="#"
      onClick={ () => filterHandler(agent)}
      className="mt-1 group flex items-center px-3 py-2 text-sm leading-5 font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:text-gray-900 focus:bg-gray-200 transition ease-in-out duration-150">
      {
        !agent && <svg className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-focus:text-gray-500 transition ease-in-out duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
      }

      {
        agent &&
        <div className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400 group-focus:text-gray-500 transition ease-in-out duration-150">
          <Avatar
            size={6}
            src={agent.avatarUrl}
          />
        </div>
      }

      <span className="truncate">
        {agent && (agent.name || agent.email)}
        {!agent && (label || 'Unassigned') }
      </span>

      <span className="ml-auto inline-block py-0.5 px-3 text-xs leading-4 rounded-full text-gray-600 bg-gray-200 group-hover:bg-gray-200 group-focus:bg-gray-300 transition ease-in-out duration-150">
        {count}
      </span>
    </a>
  )
}

function mapStateToProps (state) {
  const { app, conversations } = state
  return {
    conversations,
    app
  }
}

export default withRouter(connect(mapStateToProps)(SidebarAgents))
