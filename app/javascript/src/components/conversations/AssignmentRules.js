import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { setCurrentPage, setCurrentSection } from '../../actions/navigation'
import { errorMessage, successMessage } from '../../actions/status_messages'
import FormDialog from '../FormDialog'
import defaultFields from '../../shared/defaultFields'
import Button from '../Button'
import { InlineFilterDialog } from '../segmentManager'
import SegmentItemButton from '../segmentManager/itemButton'

import Input from '../forms/Input'

import arrayMove from 'array-move'
/* import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc'; */

import { AGENTS, ASSIGNMENT_RULES } from '../../graphql/queries'

import {
  CREATE_ASSIGNMENT_RULE,
  EDIT_ASSIGNMENT_RULE,
  DELETE_ASSIGNMENT_RULE,
  UPDATE_RULE_PRIORITIES
} from '../../graphql/mutations'

import graphql from '../../graphql/client'
import serialize from 'form-serialize'
import { QueueIcon } from '../icons'

import PageHeader from '../PageHeader'
import Alert from '../Alert'

import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from 'react-sortable-hoc'

const DragHandle = sortableHandle(() => (
  <div>
    <QueueIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
  </div>
))

const SortableItem = sortableElement(
  ({ object, deleteRule, edit, classes }) => (
    <li>
      <div
        href="#"
        className="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
      >
        <div className="flex items-center px-4 py-4 sm:px-6">
          <div>
            <DragHandle />
          </div>

          <div className="min-w-0 flex-1 flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-12 w-12 rounded-full"
                src={`${object.avatarUrl}`}
                alt=""
              />
            </div>
            <div className="flex w-full px-4 md:div md:div-cols-2 md:gap-4 justify-between">
              <div>
                <div className="text-lg leading-5 font-medium text-indigo-600 truncate">
                  {object.title}
                </div>
                <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
                  <span className="truncate">{object.agent.email}</span>
                </div>
              </div>

              <div className="hidden md:block">
                {/* <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
                <button>edit</button>
                <button>delete</button>
                </div> */}

                <button
                  variant="contained"
                  color={'outlined'}
                  className="mr-1 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700 transition duration-150 ease-in-out"
                  onClick={(e) => {
                    e.preventDefault()
                    edit(object)
                  }}
                >
                  edit
                </button>

                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700 transition duration-150 ease-in-out"
                  onClick={(e) => {
                    e.preventDefault()
                    deleteRule(object)
                  }}
                >
                  delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
)

const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="border-b">{children}</ul>
})

function AssignmentRules ({ dispatch, match, app }) {
  const formRef = React.useRef()

  const [state, setState] = React.useState({
    isOpen: false,
    currentRule: null,
    rules: [],
    conditions: []
  })

  React.useEffect(() => {
    dispatch(setCurrentPage('Assignment Rules'))
    dispatch(setCurrentSection('Conversations'))
    getAssignmentRules()
  }, [])

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setState({
      ...state,
      rules: arrayMove(state.rules, oldIndex, newIndex)
    })

    updatePriorities()
  }

  const open = () => setState({ ...state, isOpen: true })
  const close = () => setState({ ...state, isOpen: false })

  const definitions = () => {
    return [
      {
        name: 'name',
        type: 'string',
        div: { xs: 12, sm: 6 }
      },
      {
        name: 'agent',
        type: 'select',
        options: ['dark', 'light'],
        div: { xs: 12, sm: 6 }
      }
    ]
  }

  const updatePriorities = () => {
    graphql(
      UPDATE_RULE_PRIORITIES,
      {
        appKey: app.key,
        rules: state.rules
      },
      {
        success: (data) => {
          dispatch(successMessage('rules sorted!'))
        }
      }
    )
  }

  const submitAssignment = () => {
    if (state.currentRule) {
      editAssignmentRule()
    } else {
      createAssignmentRule()
    }
  }

  const getAssignmentRules = () => {
    graphql(
      ASSIGNMENT_RULES,
      {
        appKey: app.key
      },
      {
        success: (data) => {
          setState({ ...state, rules: data.app.assignmentRules })
        },
        error: () => {
          debugger
        }
      }
    )
  }

  const createAssignmentRule = (opts) => {
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true
    })

    graphql(
      CREATE_ASSIGNMENT_RULE,
      {
        appKey: app.key,
        title: serializedData.title,
        agentId: serializedData.agent,
        active: serializedData.active,
        conditions: state.conditions
      },
      {
        success: (data) => {
          const rule = data.createAssignmentRule.assignmentRule
          setState({
            ...state,
            rules: state.rules.concat(rule),
            isOpen: false
          })
        },
        error: () => {}
      }
    )
  }

  const editAssignmentRule = (opts) => {
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true
    })

    graphql(
      EDIT_ASSIGNMENT_RULE,
      {
        appKey: app.key,
        ruleId: state.currentRule.id,
        title: serializedData.title,
        agentId: serializedData.agent,
        active: serializedData.active,
        conditions: state.conditions
      },
      {
        success: (data) => {
          const rule = data.editAssignmentRule.assignmentRule
          const collection = state.rules.map((o) => {
            if (o.id === rule.id) {
              return rule
            } else {
              return o
            }
          })

          setState({
            ...state,
            rules: collection,
            currentRule: null,
            isOpen: false
          })
        },
        error: () => {}
      }
    )
  }

  const deleteAssignmentRule = (opts) => {
    graphql(
      DELETE_ASSIGNMENT_RULE,
      {
        appKey: app.key,
        ruleId: opts.id
      },
      {
        success: (data) => {
          const rule = data.deleteAssignmentRule.assignmentRule
          const collection = state.rules.filter((o) => o.id !== rule.id)
          setState({
            ...state,
            rules: collection,
            currentRule: null
          })
        },
        error: () => {}
      }
    )
  }

  const edit = (rule) => {
    setState({
      ...state,
      currentRule: rule,
      isOpen: true
    })
  }

  const deleteRule = (rule) => {
    setState({
      ...state,
      currentRule: rule
    })

    deleteAssignmentRule(rule)
  }

  const { isOpen } = state

  const defaultConditions = [
    {
      type: 'match',
      attribute: 'match',
      comparison: 'and',
      value: 'and'
    }
  ]

  return (
    <div className="p-4">
      <PageHeader
        title="Assignment Rules"
        actionHandler={open}
        actionLabel={'New Rule'}
        actions={
          <Button
            style={{ alignSelf: 'flex-end' }}
            variant="contained"
            color="primary"
            onClick={() =>
              setState({
                ...state,
                isOpen: true,
                currentRule: null
              })
            }
          >
            Create Rule
          </Button>
        }
      ></PageHeader>

      <FormDialog
        open={state.isOpen}
        titleContent={'Edit rule'}
        handleClose={close}
        formComponent={
          <form
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
            className="px-8 pt-6 pb-8 mb-4"
          >
            <AssignmentForm
              rule={state.currentRule}
              conditions={
                state.currentRule
                  ? state.currentRule.conditions
                  : defaultConditions
              }
              setConditions={(conditions) =>
                setState({
                  ...state,
                  conditions: conditions
                })
              }
              app={app}
              dispatch={dispatch}
            />

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <span className="flex w-full rounded-md shadow-sm sm:col-start-2">
                <button
                  type="submit"
                  onClick={submitAssignment}
                  className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
                  Confirm
                </button>
              </span>
              <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:col-start-1">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
                  Cancel
                </button>
              </span>
            </div>
          </form>
        }
      />

      <SortableContainer onSortEnd={onSortEnd} useDragHandle>
        {state.rules.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            value={value.id}
            object={value}
            edit={edit}
            deleteRule={() => deleteRule(value)}
          />
        ))}
      </SortableContainer>
    </div>
  )
}

function AssignmentForm (props) {
  const { rule, setConditions, conditions, dispatch } = props

  const [agents, setAgents] = React.useState([])
  const [selected, setSelected] = React.useState(rule ? rule.agent.id : '')
  const [title, setTitle] = React.useState(rule ? rule.title : '')
  const [checked, setChecked] = React.useState('')
  const [updater, setUpdater] = React.useState(null)
  const [predicates, setPredicates] = React.useState(conditions || [])
  // const fields = defaultFields

  function availableFields () {
    if (!props.app.customFields) return defaultFields
    return props.app.customFields.concat(defaultFields)
  }

  function selectedValue () {
    if (!rule) return
    const { agent } = rule
    return { label: agent.email, value: agent.id }
  }

  function getAgents () {
    graphql(
      AGENTS,
      { appKey: props.app.key },
      {
        success: (data) => {
          setAgents(data.app.agents)
        },
        error: (error) => {}
      }
    )
  }

  React.useEffect(() => {
    getAgents()
  }, [])

  React.useEffect(() => {
    setConditions(predicates)
  }, [predicates])

  function handleChange (e) {
    setSelected(e.value)
  }

  function displayName (o) {
    return o.attribute.split('_').join(' ')
  }

  function getTextForPredicate (o) {
    if (o.type === 'match') {
      return `Match ${o.value === 'and' ? 'all' : 'any'} criteria`
    } else {
      return `${displayName(o)} ${o.comparison ? o.comparison : ''} ${
        o.value ? o.value : ''
      }`
    }
  }

  function addPredicate (data) {
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }
    setPredicates(predicates.concat(pending_predicate))

    // it forces a re render on itemButton for new predicates
    setTimeout(() => {
      setUpdater(Math.random())
    }, 2)
  }

  function updatePredicates (data) {
    setPredicates(data)
  }

  function deletePredicate (data) {
    setPredicates(data)
  }

  return (
    <div>
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap'
          }}
        >
          {predicates.map((o, i) => {
            return (
              <SegmentItemButton
                key={i}
                index={i}
                predicate={o}
                predicates={predicates}
                open={!o.comparison}
                updater={updater}
                appearance={o.comparison ? 'primary' : 'default'}
                text={getTextForPredicate(o)}
                updatePredicate={updatePredicates}
                predicateCallback={(jwtToken) => {
                  debugger
                }}
                deletePredicate={(items) => {
                  deletePredicate(items)
                }}
              />
            )
          })}

          {
            <InlineFilterDialog
              app={props.app}
              fields={availableFields}
              addPredicate={(predicate) => {
                addPredicate(predicate)
              }}
            />
          }
        </div>
      </div>

      <Input
        label={'title'}
        value={title}
        name="title"
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        helperText={'ssdds'}
      ></Input>

      {agents.length > 0 && (
        <Input
          type={'select'}
          name={'agent'}
          id={'agent'}
          label={'select agent'}
          value={selectedValue()}
          options={agents.map((o) => ({ value: o.id, label: o.email }))}
          onChange={handleChange}
        ></Input>
      )}

      <Input
        label={'Activate'}
        type={'checkbox'}
        name={'active'}
        value={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    </div>
  )
}

function mapStateToProps (state) {
  const { auth, app, conversations, app_user } = state
  const { loading, isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    conversations,
    app_user,
    app,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(AssignmentRules))
