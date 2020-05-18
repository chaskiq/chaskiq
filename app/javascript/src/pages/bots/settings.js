import React, { useState, useEffect } from 'react'

import Button from '../../components/Button'
import Tabs from '../../components/Tabs'

import ContentHeader from '../../components/PageHeader'
import Content from '../../components/Content'
import Input from '../../components/forms/Input'
import graphql from '../../graphql/client'
import { AGENTS } from '../../graphql/queries'

import { updateApp } from '../../actions/app'
import { setCurrentPage } from '../../actions/navigation'

const SettingsForm = ({ app, data, errors, dispatch }) => {
  const [tabValue, setTabValue] = useState(0)
  const [state, setState] = useState({})
  const [agents, setAgents] = useState([])

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

  let formRef

  function tabsContent () {
    return (
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: 'For Leads',
            content: (
              <LeadsSettings
                app={app}
                updateData={updateState}
                agents={agents}
                getAgents={getAgents}
                submit={submit}
                namespace={'lead_tasks_settings'}
              />
            )
          },
          {
            label: 'For Users',
            content: (
              <UsersSettings
                app={app}
                updateData={updateState}
                agents={agents}
                getAgents={getAgents}
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
        <ContentHeader title={'Bot default settings'} items={[]} />

        {/* JSON.stringify(state) */}
        {tabsContent()}
      </Content>
    </div>
  )
}

function UsersSettings ({ app, updateData, namespace, submit }) {
  const [state, setState] = React.useState(app.userTasksSettings || {})

  useEffect(() => {
    updateData({ users: state })
  }, [state])

  const handleChange = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked })
  }

  function submitData () {
    const data = { [namespace]: state }
    submit(data)
  }

  return (
    <div>
      <div className="py-4">
        <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
          When users start a conversation
        </p>

        <Input
          type="checkbox"
          label="Leave a 2 minute delay before triggering Task Bots during office hours"
          checked={state.delay}
          onChange={handleChange('delay')}
          value="delay"
        />
      </div>

      <div className="py-4">
        <Button size={'medium'}
          variant={'contained'} onClick={submitData}>
          save
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
  namespace
}) {
  const [state, setState] = React.useState(app.leadTasksSettings || {})

  useEffect(() => {
    updateData({ leads: state })
  }, [state])

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
          When leads start a conversation
        </p>

        <div container direction="column">
          <Input
            type="checkbox"
            checked={state.delay}
            onChange={handleChange('delay')}
            value={state.delay}
            label="Leave a 2 minute delay before triggering Task Bots during office hours"
          />

          <Input
            type="checkbox"
            checked={state.share_typical_time}
            onChange={handleChange('share_typical_time')}
            value={state.share_typical_time}
            label="Share your typical reply time"
          />

        </div>

        <hr />

        <p className="text-lg leading-6 font-medium text-gray-900 py-4">
          Route existing customers to support
        </p>

        <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
          Route leads to the right people by asking if they are an existing
          customer when they start a new conversation.
        </p>

        <h2 className="font-bold mb-2">
          What do you want to do when they choose "Yes, I'm a customer"?
        </h2>

        <div className="flex items-center">
          <Input
            type="radio"
            name="routing"
            //value={state.routing}
            onChange={handleRadioChange}
            value="assign"
            defaultChecked={state.routing === "assign"}
            label="Assign the conversation"
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
          label="Close the conversation"
        />

        <hr />

        <p className="text-lg leading-6 font-medium text-gray-900 py-4">
          Ask for contact details
        </p>

        <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
          If we don’t already have their contact details, Operator will suggest
          that customers leave their email address or their phone number to get
          notified whenever you reply.
        </p>

        <Input
          type="radio"
          name="email_requirement"
          defaultChecked={state.email_requirement === 'never'}
          value={'never'}
          onChange={handleRadioChange}
          label="Don't ask for email"
        />

        <Input
          type="radio"
          name="email_requirement"
          //value={state.email_requirement}
          onChange={handleRadioChange}
          defaultChecked={state.email_requirement === 'email_or_phone'}
          label="Ask for email or mobile number"
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
          label="Ask for email only"
        />
      </div>

      <div className="py-4">
        <Button size={'medium'}
          variant={'contained'}
          onClick={submitData}>
          save
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
    console.log('assignee', selected)
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
      {/* <FormControl>
        <InputLabel htmlFor="agent">agent</InputLabel>
        <Select
          value={selected}
          onChange={handleChange}
          inputProps={{
            name: 'agent',
            id: 'agent',
          }}
        >

          {
            agents.map((o)=>(
              <MenuItem key={`agent-${o.id}`} value={o.id}>
                {o.email}
              </MenuItem>
            ))
          }

        </Select>
      </FormControl>
      */}
    </div>
  )
}

export default SettingsForm
