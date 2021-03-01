import React, { useState, useEffect } from 'react'

import Button from '../../components/Button'
import Tabs from '../../components/Tabs'

import ContentHeader from '../../components/PageHeader'
import Content from '../../components/Content'
import Input from '../../components/forms/Input'
import graphql from '../../graphql/client'
import defaultFields from '../../shared/defaultFields'

import { InlineFilterDialog } from '../../components/segmentManager'
import SegmentItemButton from '../../components/segmentManager/itemButton'

import { AGENTS, BOT_TASKS } from '../../graphql/queries'

import { updateApp } from '../../actions/app'
import { setCurrentPage } from '../../actions/navigation'
import { DeleteIcon } from '../../components/icons'
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
          {I18n.t('task_bots.settings.users.start_conversation')}
        </p>

        <Input
          type="checkbox"
          label={I18n.t('task_bots.settings.users.delay')}
          checked={state.delay}
          onChange={handleChange('delay')}
          value="delay"
        />

        {/*

        <Input
          type="checkbox"
          checked={state.override_with_task}
          onChange={handleChange('override_with_task')}
          value={state.override_with_task}
          label={ I18n.t('task_bots.settings.users.override.label') }
          hint={ I18n.t('task_bots.settings.users.override.hint') }
        />

          state.override_with_task &&
          <div className="pl-1 py-4">
            <TasksList
              app={app}
              tasks={tasks}
              getTasks={getTasks}
              setValue={setValue}
              value={state}
            />
          </div>
        */}
      </div>

      <div className="py-4">
        <Button size={'medium'}
          variant={'success'} onClick={submitData}>
          {I18n.t('common.save')}
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

  /*
  useEffect(() => {
    if (!state.override_with_task) setState({ ...state, trigger: null })
  }, [state.override_with_task])
  */

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
          {I18n.t('task_bots.settings.leads.start_conversation')}
        </p>

        <div>
          <Input
            type="checkbox"
            checked={state.delay}
            onChange={handleChange('delay')}
            value={state.delay}
            label={I18n.t('task_bots.settings.leads.delay')}
          />

          <Input
            type="checkbox"
            checked={state.share_typical_time}
            onChange={handleChange('share_typical_time')}
            value={state.share_typical_time}
            label={I18n.t('task_bots.settings.leads.share_time')}
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
            <div className="pl-1 py-4">
              <TasksList
                app={app}
                tasks={tasks}
                getTasks={getTasks}
                setValue={setValue}
                value={state}
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
            // value={state.routing}
            onChange={handleRadioChange}
            value="assign"
            defaultChecked={state.routing === 'assign'}
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
          defaultChecked={state.routing === 'close'}
          // value={state.routing}
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
          // value={state.email_requirement}
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
          variant={'success'}
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

function TasksList ({ app, tasks, getTasks, setValue, value }) {
  const [items, setItems] = React.useState(value.task_rules || [])

  useEffect(() => {
    getTasks()
  }, [])

  useEffect(() => {
    setValue('task_rules', items)
  }, [JSON.stringify(items)])

  function addItem (item) {
    setItems(items.concat(item))
  }

  function updateItem (name, item, i) {
    setItems(items.map((o, index) => index !== i
      ? o : { ...o, [name]: item }
    )
    )
  }

  function addEmptyItem () {
    addItem({})
  }

  function deleteItem (i) {
    setItems(items.filter((item, index) => index !== i))
  }

  return (
    <div>
      {/*
        items.map((o, i) => (
          <TaskSelector
            // key={Math.random()}
            app={app}
            tasks={tasks}
            item={o}
            index={i}
            deleteRule={deleteItem}
            updateRule={updateItem}
          />
        ))

      <Button
        variant="outlined"
        size="xs"
        onClick={addEmptyItem}>
        <PlusIcon/> Add rule
      </Button>
      */}

    </div>
  )
}

function TaskSelector ({
  app,
  tasks,
  item,
  index,
  value,
  deleteRule,
  updateRule
}) {
  const [selected, setSelected] = React.useState(item.trigger)

  useEffect(() => {
    // setValue(selected, index)
    updateRule('trigger', selected, index)
  }, [selected])

  function handleChange (e) {
    setSelected(e.value)
  }

  const selectedTask = tasks.find((o) => o.id === selected)
  let defaultValue = null
  if (selectedTask) {
    defaultValue = { label: selectedTask.title, value: selectedTask.id }
  }

  const options = [{ label: 'none', value: null }].concat(
    tasks.map((o) => ({ label: o.title, value: o.id }))
  )

  return (
    <div className="w-3/4 border rounded-md p-3 mb-2">

      <div className="flex justify-between items-center">

        <div className="w-3/4">
          <RuleSelector
            data={ item.predicates || [] }
            app={app}
            update={(item) => updateRule('predicates', item, index) }
          />

          <div className="pt-2">
            <Input
              type="select"
              label="Task bot"
              value={defaultValue}
              onChange={handleChange}
              defaultValue={defaultValue}
              name={'trigger'}
              id={'trigger'}
              data={{}}
              options={options}
            />
          </div>
        </div>

        <Button
          variant='icon'
          size="small"
          onClick={() => deleteRule(index)}>
          <DeleteIcon/>
        </Button>
      </div>
    </div>
  )
}

function RuleSelector ({ app, update, data }) {
  const [predicates, setPredicates] = React.useState(data)

  React.useEffect(() => {
    update(predicates)
  }, [predicates])

  function updatePredicates (data) {
    setPredicates(data)
  }

  function deletePredicate (data) {
    setPredicates(data)
  }

  function addPredicate (data) {
    const pendingPredicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }
    setPredicates(predicates.concat(pendingPredicate))
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

  return <div
    style={{
      display: 'flex',
      flexWrap: 'wrap'
    }}>
    {
      predicates.map((o, i) => {
        return <div
          className="mr-2"
          key={i}>
          <SegmentItemButton
            key={i}
            index={i}
            predicate={o}
            predicates={predicates}
            open={!o.comparison}
            // updater={updater}
            appearance={o.comparison ? 'primary' : 'default'}
            text={getTextForPredicate(o)}
            updatePredicate={updatePredicates}
            // predicateCallback={(jwtToken) => {
            //  debugger
            // }}
            deletePredicate={(items) => {
              deletePredicate(items)
            }}
          />

        </div>
      })
    }

    <InlineFilterDialog
      app={app}
      fields={defaultFields}
      addPredicate={(predicate) => {
        addPredicate(predicate)
      }}
    />
  </div>
}

export default SettingsForm
