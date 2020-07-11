import React, { useState, useEffect } from 'react'

import Button from '../../components/Button'
import Tabs from '../../components/Tabs'

import ContentHeader from '../../components/PageHeader'
import Content from '../../components/Content'
import Input from '../../components/forms/Input'
import graphql from '../../graphql/client'
import { AGENTS, BOT_TASKS } from '../../graphql/queries'

import { updateApp } from '../../actions/app'
import { setCurrentPage } from '../../actions/navigation'
import I18n from '../../shared/FakeI18n'

const SettingsForm = ({ app, data, errors, dispatch }) => {
  const [tabValue, setTabValue] = useState(0)
  const [state, setState] = useState({})
  const [agents, setAgents] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    dispatch(setCurrentPage('botSettings'))
  }, [])

  function getAgents () {
    graphql(
      AGENTS,
      { appKey: app.key },
      {
        success: (data) => {
          setAgents(data.app.agents)
        },
        error: (error) => {}
      }
    )
  }

  function getTasks (mode) {
    graphql(
      BOT_TASKS,
      { appKey: app.key, mode: mode },
      {
        success: (data) => {
          setTasks(data.app.botTasks)
        },
        error: (error) => {}
      }
    )
  }

  const getTasksFor = (name) => () => {
    getTasks(name)
  }

  let formRef

  function tabsContent () {
    return (
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: I18n.t('task_bots.settings.leads.tab'),
            content: (
              <LeadsSettings
                app={app}
                updateData={updateState}
                agents={agents}
                getAgents={getAgents}
                tasks={tasks}
                getTasks={getTasksFor('leads')}
                submit={submit}
                namespace={'lead_tasks_settings'}
              />
            )
          },
          {
            label: I18n.t('task_bots.settings.users.tab'),
            content: (
              <UsersSettings
                app={app}
                updateData={updateState}
                agents={agents}
                getAgents={getAgents}
                tasks={tasks}
                getTasks={getTasksFor('users')}
                submit={submit}
                namespace={'user_tasks_settings'}
              />
            )
          }
        ]}
      ></Tabs>
    )
  }

  function submit (params) {
    dispatch(updateApp(params))
  }

  function handleTabChange (e, i) {
    setTabValue(i)
  }

  function updateState (newData) {
    setState(Object.assign({}, data, newData))
  }

  return (
    <div>
      <Content>
        <ContentHeader title={
          I18n.t('task_bots.title')
        } items={[]} />
        {tabsContent()}
      </Content>
    </div>
  )
}

function UsersSettings ({
  app,
  updateData,
  namespace,
  submit,
  tasks,
  getTasks
}) {
  const [state, setState] = React.useState(app.userTasksSettings || {})

  useEffect(() => {
    updateData({ users: state })
  }, [state])

  useEffect(() => {
    if (!state.override_with_task) setState({ ...state, trigger: null })
  }, [state.override_with_task])

  const handleChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked })
  }

  const setValue = (name, value) => {
    setState({ ...state, [name]: value })
  }

  function submitData () {
    const data = { [namespace]: state }
    submit(data)
  }

  return (
    <div>
      <div className="py-4">
        <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
          {I18n.t("task_bots.settings.users.start_conversation")}
        </p>

        <Input
          type="checkbox"
          label={I18n.t('task_bots.settings.users.delay')}
          checked={state.delay}
          onChange={handleChange('delay')}
          value="delay"
        />

        <Input
          type="checkbox"
          checked={state.override_with_task}
          onChange={handleChange('override_with_task')}
          value={state.override_with_task}
          label={ I18n.t('task_bots.settings.users.override.label') }
          hint={ I18n.t('task_bots.settings.users.override.hint') }
        />

        {
          state.override_with_task &&
          <div className="w-1/4 pl-5">
            <TaskSelector
              tasks={tasks}
              getTasks={getTasks}
              setValue={setValue}
              value={state.trigger}
            />
          </div>
        }
      </div>

      <div className="py-4">
        <Button size={'medium'}
          variant={'contained'} onClick={submitData}>
          {I18n.t("common.save")}
        </Button>
      </div>
    </div>
  )
}

function LeadsSettings ({
  app,
  updateData,
  agents,
  getAgents,
  submit,
  namespace,
  tasks,
  getTasks
}) {
  const [state, setState] = React.useState(app.leadTasksSettings || {})

  useEffect(() => {
    updateData({ leads: state })
  }, [state])

  useEffect(() => {
    if (!state.override_with_task) setState({ ...state, trigger: null })
  }, [state.override_with_task])

  const handleChange = (name) => (event) => {
    setValue(name, event.target.checked)
  }

  function handleRadioChange (event) {
    const name = event.target.name
    setState({ ...state, [name]: event.target.value })
  }

  const setValue = (name, value) => {
    setState({ ...state, [name]: value })
  }

  function submitData () {
    const data = { [namespace]: state }
    submit(data)
  }

  return (
    <div>
      <div className="py-4">
        <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
          {I18n.t("task_bots.settings.leads.start_conversation")}
        </p>

        <div container direction="column">
          <Input
            type="checkbox"
            checked={state.delay}
            onChange={handleChange('delay')}
            value={state.delay}
            label={I18n.t("task_bots.settings.leads.delay")}
          />

          <Input
            type="checkbox"
            checked={state.share_typical_time}
            onChange={handleChange('share_typical_time')}
            value={state.share_typical_time}
            label={I18n.t("task_bots.settings.leads.share_time")}
          />

          <Input
            type="checkbox"
            checked={ state.override_with_task }
            onChange={ handleChange('override_with_task') }
            value={ state.override_with_task }
            label={ I18n.t('task_bots.settings.leads.override.label') }
            helperText={ I18n.t('task_bots.settings.leads.override.hint') }
          />

          {
            state.override_with_task &&
            <div className="w-1/4 pl-5">
              <TaskSelector
                tasks={tasks}
                getTasks={getTasks}
                setValue={setValue}
                value={state.trigger}
              />
            </div>
          }
        </div>

        <hr />

        <p className="text-lg leading-6 font-medium text-gray-900 py-4">
          {I18n.t('task_bots.settings.leads.route')}
        </p>

        <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
          {I18n.t('task_bots.settings.leads.route_desc')}
        </p>

        <h2 className="font-bold mb-2">
          {I18n.t('task_bots.settings.leads.route_costumer')}
        </h2>

        <div className="flex items-center">
          <Input
            type="radio"
            name="routing"
            //value={state.routing}
            onChange={handleRadioChange}
            value="assign"
            defaultChecked={state.routing === "assign"}
            label={I18n.t('task_bots.settings.leads.assign')}
          ></Input>

          <div className="w-1/4 pl-5">
            {state.routing === 'assign' && (
              <AgentSelector
                agents={agents}
                getAgents={getAgents}
                setValue={setValue}
                value={state.assignee}
              />
            )}
          </div>
        </div>

        <Input
          name="routing"
          type="radio"
          value="close"
          defaultChecked={state.routing === "close"}
          //value={state.routing}
          onChange={handleRadioChange}
          label={I18n.t('task_bots.settings.leads.close')}
        />

        <hr />

        <p className="text-lg leading-6 font-medium text-gray-900 py-4">
          {I18n.t('task_bots.settings.leads.ask')}
        </p>

        <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
          {I18n.t('task_bots.settings.leads.ask_hint')}
        </p>

        <Input
          type="radio"
          name="email_requirement"
          defaultChecked={state.email_requirement === 'never'}
          value={'never'}
          onChange={handleRadioChange}
          label={I18n.t('task_bots.settings.leads.dont_ask_email')}
        />

        <Input
          type="radio"
          name="email_requirement"
          //value={state.email_requirement}
          onChange={handleRadioChange}
          defaultChecked={state.email_requirement === 'email_or_phone'}
          label={I18n.t('task_bots.settings.leads.ask_email_phone')}
          value="email_or_phone"
          labelPlacement="end"
        />

        <Input
          type="radio"
          name="email_requirement"
          // value={state.email_requirement}
          onChange={handleRadioChange}
          value="email_only"
          defaultChecked={state.email_requirement === 'email_only'}
          label={I18n.t('task_bots.settings.leads.email_only')}
        />
      </div>

      <div className="py-4">
        <Button size={'medium'}
          variant={'contained'}
          onClick={submitData}>
          {I18n.t('common.save')}
        </Button>
      </div>
    </div>
  )
}

function AgentSelector ({ agents, getAgents, setValue, value }) {
  const [selected, setSelected] = React.useState(value)

  useEffect(() => {
    getAgents()
  }, [])

  useEffect(() => {
    setValue('assignee', selected)
  }, [selected])

  function handleChange (e) {
    setSelected(e.value)
  }

  const selectedAgent = agents.find((o) => o.id === selected)
  let defaultValue = null
  if (selectedAgent) {
    defaultValue = { label: selectedAgent.email, value: selectedAgent.id }
  }

  return (
    <div>
      <Input
        type="select"
        value={defaultValue}
        onChange={handleChange}
        // defaultValue={selected}
        defaultValue={defaultValue}
        name={'agent'}
        id={'agent'}
        data={{}}
        options={agents.map((o) => ({ label: o.email, value: o.id }))}
      ></Input>
    </div>
  )
}

function TaskSelector ({ tasks, getTasks, setValue, value }) {
  const [selected, setSelected] = React.useState(value)

  useEffect(() => {
    getTasks()
  }, [])

  useEffect(() => {
    setValue('trigger', selected)
  }, [selected])

  function handleChange (e) {
    setSelected(e.value)
  }

  const selectedAgent = tasks.find((o) => o.id === selected)
  let defaultValue = null
  if (selectedAgent) {
    defaultValue = { label: selectedAgent.title, value: selectedAgent.id }
  }

  const options = [{label: 'none', value: null}].concat(
    tasks.map((o) => ({ label: o.title, value: o.id }))
  )

  return (
    <div>
      <Input
        type="select"
        value={defaultValue}
        onChange={handleChange}
        // defaultValue={selected}
        defaultValue={defaultValue}
        name={'trigger'}
        id={'trigger'}
        data={{}}
        options={options}
      ></Input>
    </div>
  )
}

export default SettingsForm
