import React, { useState, useEffect } from 'react'
import { withRouter, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import arrayMove from 'array-move'

import Button from '../components/Button'
import Input from '../components/forms/Input'

import ContentHeader from '../components/PageHeader'
import Content from '../components/Content'
import Table from '../components/Table'

import { AnchorLink } from '../shared/RouterLink'
import graphql from '../graphql/client'
import { BOT_TASKS } from '../graphql/queries'
import {
  CREATE_BOT_TASK,
  DELETE_BOT_TASK,
  REORDER_BOT_TASK
} from '../graphql/mutations'

import BotEditor from './bots/editor'
import FormDialog from '../components/FormDialog'
import Badge from '../components/Badge'

import SettingsForm from './bots/settings'
import EmptyView from '../components/EmptyView'
import DeleteDialog from '../components/DeleteDialog'
import { successMessage, errorMessage } from '../actions/status_messages'
import { setCurrentSection, setCurrentPage } from '../actions/navigation'

import FilterMenu from '../components/FilterMenu'

const BotDataTable = ({ app, match, history, mode, dispatch }) => {
  const [loading, setLoading] = useState(false)
  const [botTasks, setBotTasks] = useState([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null)
  const [openTaskForm, setOpenTaskForm] = useState(false)
  const [meta, setMeta] = useState({})
  const [options, setOptions] = useState(optionsForFilter())
  const [stateOptions, setStateOptions] = useState(optionsForState())

  function init () {
    dispatch(setCurrentPage(`bot_${mode}`))

    graphql(
      BOT_TASKS,
      {
        appKey: app.key,
        mode: mode,
        filters: getFilters()
      },
      {
        success: (data) => {
          setBotTasks(data.app.botTasks)
        },
        error: () => {
          debugger
        }
      }
    )
  }

  useEffect(init, [
    match.url,
    JSON.stringify(options),
    JSON.stringify(stateOptions)
  ])

  // useEffect(init [match])
  function onSortEnd (oldIndex, newIndex) {
    const op1 = botTasks[oldIndex]
    const op2 = botTasks[newIndex]

    graphql(REORDER_BOT_TASK,
      {
        appKey: app.key,
        id: op1.id,
        idAfter: op2.id,
        mode: mode
      },
      {
        success: (res) => { dispatch(successMessage('reordered correctly')) },
        error: (res) => { dispatch(errorMessage('reordered correctly')) }
      }
    )

    setBotTasks(arrayMove(botTasks, oldIndex, newIndex))

    setTimeout(() => {

    }, 2000)
  }

  function removeBotTask (o) {
    graphql(
      DELETE_BOT_TASK,
      { appKey: app.key, id: o.id },
      {
        success: (data) => {
          const newData = botTasks.filter((item) => item.id != o.id)
          setBotTasks(newData)
          setOpenDeleteDialog(null)
          dispatch(successMessage(I18n.t('task_bots.remove_success')))
        },
        error: () => {
          debugger
        }
      }
    )
  }

  function getFilters () {
    return {
      state: stateOptions.filter((o) => o.state === 'checked').map((o) => o.id),
      users: options.filter((o) => o.state === 'checked').map((o) => o.id)
    }
  }

  function toggleTaskForm () {
    setOpenTaskForm(!openTaskForm)
  }

  function optionsForFilter () {
    const options = [
      {
        title: 'Visitors',
        description: 'visitors on the platform',
        // icon: <UnsubscribeIcon/>,
        id: 'visitors',
        state: 'checked'
      },
      {
        title: 'Leads',
        description: 'Visitors who make an actions',
        // icon: <UnsubscribeIcon/>,
        id: 'leads',
        state: 'checked'
      },
      {
        title: 'Users',
        description: "your platform's registered users",
        // icon: <UnsubscribeIcon/>,
        id: 'users',
        state: 'checked'
      }
    ]
    return options
  }

  function optionsForState () {
    const options = [
      {
        title: 'Enabled',
        description: 'enabled bot tasks',
        // icon: <UnsubscribeIcon/>,
        id: 'enabled',
        state: 'checked'
      },
      {
        title: 'Disabled',
        description: 'Disabled bot tasks',
        // icon: <UnsubscribeIcon/>,
        id: 'disabled',
        state: 'checked'
      }
    ]
    return options
  }

  function namesForToggleButton (opts) {
    const names = opts
      .filter((o) => o.state === 'checked')
      .map((o) => o.title)
      .join(', ')
    return names === ''
      ? opts.map((o) => o.title)
        .join(', ') : names
  }

  function toggleButton (clickHandler) {
    return (
      <div>
        <Button
          onClick={clickHandler}>
          {namesForToggleButton(options)}
        </Button>
      </div>
    )
  }

  function toggleStateButton (clickHandler) {
    return (
      <div>
        <Button
          onClick={clickHandler}>
          {namesForToggleButton(stateOptions)}
        </Button>
      </div>
    )
  }

  function handleClickforOptions (opts, option) {
    return opts.map((o) => {
      if (o.id === option.id) {
        const checked = option.state === 'checked' ? '' : 'checked'
        return { ...option, state: checked }
      } else {
        return o
      }
    })
  }

  function handleClickforState (opts, option) {
    const checkeds = opts.filter((o) => o.state === 'checked')

    return opts.map((o) => {
      if (o.id === option.id) {
        const isChecked = option.state === 'checked'
        const checked = isChecked ? '' : 'checked'
        if (checkeds.length === 1 && isChecked) { return o }
        return { ...option, state: checked }
      } else {
        return o
      }
    })
  }

  return (
    <div>
      <Content>
        <ContentHeader
          title={I18n.t(`task_bots.${mode}`)}
          actions={
            <div item>
              <Button
                color="inherit"
                onClick={toggleTaskForm}
                variant={"success"}
              >
                {I18n.t('task_bots.new')}
              </Button>
            </div>
          }
          tabsContent={null}
        />

        <div className="flex">
          <div className="mr-3">
            <FilterMenu
              options={options}
              value={null}
              filterHandler={(option) => {
                const newOptions = handleClickforOptions(options, option)
                setOptions(newOptions)
              }}
              triggerButton={toggleButton}
              position={'left'}
            />
          </div>

          <div>
            <FilterMenu
              options={stateOptions}
              value={null}
              filterHandler={(option) => {
                const newOptions = handleClickforState(stateOptions, option)
                setStateOptions(newOptions)
              }}
              triggerButton={toggleStateButton}
              position={'left'}
            />
          </div>
        </div>

        {!loading && botTasks.length > 0 && (
          <Table
            meta={meta}
            data={botTasks}
            title={I18n.t('task_bots.title')}
            defaultHiddenColumnNames={[]}
            search={init}
            sortable={true}
            onSort={onSortEnd}
            columns={[
              {
                field: 'name',
                title: I18n.t('definitions.bot_tasks.name.label'),
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                      <div className="flex items-center">
                        {row.id && (
                          <span className="text-lg leading-5 font-bold text-gray-900">
                            <AnchorLink to={`${match.url}/${row.id}`}>
                              {row.title}
                            </AnchorLink>
                          </span>
                        )}
                      </div>
                    </td>
                  )
              },

              {
                field: 'state',
                title: I18n.t('definitions.bot_tasks.state.label'),
                render: (row) => (
                  row && (
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                      <Badge className={
                        `bg-${row.state === 'enabled' ? 'green-500' : 'gray-200'}`}>
                        {row.state}
                      </Badge>
                    </td>
                  )
                )
              },
              {
                field: 'actions',
                title: I18n.t('definitions.bot_tasks.actions.label'),
                render: (row) => (
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <div className="flex items-center">
                      {row.id && (
                        <Button
                          color={'secondary'}
                          variant={'danger'}
                          onClick={() => setOpenDeleteDialog(row)}
                        >
                          {I18n.t('common.delete')}
                        </Button>
                      )}
                    </div>
                  </td>
                )
              }
            ]}
          ></Table>
        )}

        {!loading && botTasks.length === 0 && (
          <EmptyView
            title={I18n.t('task_bots.empty.title')}
            subtitle={
              <div>
                <Button
                  variant="text"
                  color="inherit"
                  size="large"
                  onClick={toggleTaskForm}
                >
                  {I18n.t('task_bots.empty.create_new')}
                </Button>
              </div>
            }
          />
        )}

        {openDeleteDialog && (
          <DeleteDialog
            open={openDeleteDialog}
            title={ I18n.t('task_bots.delete.title', { name: openDeleteDialog.title }) }
            closeHandler={() => {
              setOpenDeleteDialog(null)
            }}
            deleteHandler={() => {
              removeBotTask(openDeleteDialog)
            }}
          >
            <p variant="subtitle2">
              {I18n.t('task_bots.delete.hint')}
            </p>
          </DeleteDialog>
        )}
      </Content>

      {openTaskForm ? (
        <BotTaskCreate
          mode={mode}
          match={match}
          history={history}
          app={app}
          submit={() => console.log('os')}
        />
      ) : null}
    </div>
  )
}

const BotTaskCreate = ({ app, submit, history, match, mode }) => {
  // const PathDialog = ({open, close, isOpen, submit})=>{

  const [isOpen, setIsOpen] = useState(true)

  const close = () => {
    setIsOpen(false)
  }

  let titleRef = React.createRef()
  // const titleRef = null

  const handleSubmit = (e) => {
    const dataParams = {
      // id: create_UUID(),
      title: titleRef.value,
      paths: [],
      bot_type: mode
    }

    graphql(
      CREATE_BOT_TASK,
      {
        appKey: app.key,
        params: dataParams
      },
      {
        success: (data) => {
          history.push(match.url + '/' + data.createBotTask.botTask.id)
          submit && submit()
        },
        error: (error) => {
          debugger
        }
      }
    )
  }

  return (
    isOpen && (
      <FormDialog
        open={isOpen}
        handleClose={() => setIsOpen(false)}
        titleContent={I18n.t('task_bots.create.title')}
        formComponent={
          <form>
            <Input
              label={I18n.t('definitions.bot_tasks.title.label')}
              id="title"
              type={'string'}
              ref={(ref) => (titleRef = ref)}
              placeholder={I18n.t('definitions.bot_tasks.title.placeholder')}
              // defaultValue="Default Value"
              // className={classes.textField}
              helperText={I18n.t('definitions.bot_tasks.title.hint')}
            />
          </form>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} variant="outlined">
              {I18n.t('common.cancel')}
            </Button>

            <Button onClick={handleSubmit} className="mr-1">
              {I18n.t('common.create')}
            </Button>
          </React.Fragment>
        }
      ></FormDialog>
    )
  )
}

const BotContainer = ({ app, match, history, dispatch, actions }) => {
  useEffect(() => {
    dispatch(setCurrentSection('Bot'))
  }, [])

  return (
    <Switch>
      <Route
        exact
        path={[`${match.path}/settings`]}
        render={(props) => (
          <SettingsForm
            app={app}
            history={history}
            match={match}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/outbound`]}
        render={(props) => (
          <BotDataTable
            app={app}
            history={history}
            match={match}
            mode={'outbound'}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/new_conversations`]}
        render={(props) => (
          <BotDataTable
            app={app}
            history={history}
            match={match}
            mode={'new_conversations'}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/outbound/:id`]}
        render={(props) => {
          return (
            <BotEditor
              app={app}
              mode={'leads'}
              match={match}
              actions={actions}
              {...props}
            />
          )
        }}
      />

      <Route
        exact
        path={`${match.path}/new_conversations/:id`}
        render={(props) => {
          return (
            <BotEditor app={app}
              mode={'users'}
              match={match}
              {...props}
            />
          )
        }}
      />
    </Switch>
  )
}

function mapStateToProps (state) {
  const { auth, app, segment, app_user, current_user, drawer } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    app_user,
    segment,
    app,
    loading,
    isAuthenticated,
    drawer
  }
}

export default withRouter(connect(mapStateToProps)(BotContainer))
