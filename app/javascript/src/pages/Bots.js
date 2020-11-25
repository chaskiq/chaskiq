import React, { useState, useEffect } from 'react'
import { withRouter, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Button from '../components/Button'
// import TextField from '@material-ui/core/TextField'
import Input from '../components/forms/Input'

import ContentHeader from '../components/PageHeader'
import Content from '../components/Content'
import Table from '../components/Table'

import { AnchorLink } from '../shared/RouterLink'
import graphql from '../graphql/client'
import { BOT_TASKS } from '../graphql/queries'
import { CREATE_BOT_TASK, DELETE_BOT_TASK } from '../graphql/mutations'

import BotEditor from './bots/editor'
import FormDialog from '../components/FormDialog'

import SettingsForm from './bots/settings'
import EmptyView from '../components/EmptyView'
import DeleteDialog from '../components/DeleteDialog'
import { successMessage } from '../actions/status_messages'
import { setCurrentSection, setCurrentPage } from '../actions/navigation'

const BotDataTable = ({ app, match, history, mode, dispatch }) => {
  const [loading, setLoading] = useState(false)
  const [botTasks, setBotTasks] = useState([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null)
  const [openTaskForm, setOpenTaskForm] = useState(false)
  const [meta, setMeta] = useState({})

  function init () {
    dispatch(setCurrentPage(`bot${mode}`))

    graphql(
      BOT_TASKS,
      {
        appKey: app.key,
        mode: mode
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

  useEffect(init, [match.url])

  // useEffect(init [match])

  function removeBotTask (o) {
    graphql(
      DELETE_BOT_TASK,
      { appKey: app.key, id: o.id },
      {
        success: (data) => {
          const newData = botTasks.filter((item) => item.id != o.id)
          setBotTasks(newData)
          setOpenDeleteDialog(null)
          dispatch(successMessage(I18n.t('bot_tasks.remove_success')))
        },
        error: () => {
          debugger
        }
      }
    )
  }

  function toggleTaskForm () {
    setOpenTaskForm(!openTaskForm)
  }

  return (
    <div>
      <Content>
        <ContentHeader
          title={mode}
          actions={
            <div item>
              <Button
                color="inherit"
                onClick={toggleTaskForm}
              >
                {I18n.t('task_bots.new')}
              </Button>
            </div>
          }
          tabsContent={null}
        />

        {!loading && botTasks.length > 0 && (
          <Table
            meta={meta}
            data={botTasks}
            title={I18n.t('task_bots.title')}
            defaultHiddenColumnNames={[]}
            search={init}
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

              { field: 'state', title: I18n.t('definitions.bot_tasks.state.label') },
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
      type: mode
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
        path={[`${match.path}/users`]}
        render={(props) => (
          <BotDataTable
            app={app}
            history={history}
            match={match}
            mode={'users'}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/leads`]}
        render={(props) => (
          <BotDataTable
            app={app}
            history={history}
            match={match}
            mode={'leads'}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/leads/:id`]}
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
        path={`${match.path}/users/:id`}
        render={(props) => {
          return (
            <BotEditor app={app} mode={'users'} match={match} {...props} />
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
