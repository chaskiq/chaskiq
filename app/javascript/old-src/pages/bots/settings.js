import React, {Component, useState, useEffect} from 'react'
import FieldRenderer from '../../shared/FormFields'

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Box from '@material-ui/core/Box'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormLabel from '@material-ui/core/FormLabel'
import Divider from '@material-ui/core/Divider'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import {toSnakeCase} from '../../shared/caseConverter'
import serialize from 'form-serialize'

import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'

import graphql from '../../graphql/client'
import {AGENTS} from '../../graphql/queries'
import {UPDATE_APP} from '../../graphql/mutations'

import { 
  updateApp
} from '../../actions/app'
import { setCurrentPage } from '../../actions/navigation'

const SettingsForm = ({app, data, errors, dispatch}) => {

  const [tabValue, setTabValue] = useState(0)
  const [state, setState] = useState({})
  const [agents, setAgents] = useState([])

  useEffect(()=>{
    dispatch(setCurrentPage("botSettings"))
  }, [])

  function getAgents(){
    graphql(AGENTS, {appKey: app.key }, {
      success: (data)=>{
        setAgents(data.app.agents)
      }, 
      error: (error)=>{
      }
    })
  }

  let formRef 

  function tabsContent(){
    return <Tabs value={tabValue} 
              onChange={handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="For Leads" />
              <Tab textColor="inherit" label="For Users" />
            </Tabs>
  }

  function submit(params){
    dispatch(updateApp(params))
  }

  function handleTabChange(e, i){
    setTabValue(i)
  }

  function updateState(newData){
    setState(Object.assign({}, data, newData))
  }

  const renderTabcontent = ()=>{
    switch (tabValue){
      case 0:
        return <LeadsSettings 
                  app={app}
                  updateData={updateState} 
                  agents={agents} 
                  getAgents={getAgents}
                  submit={submit}
                  namespace={"lead_tasks_settings"}
                />
      case 1:
        return <UsersSettings 
                  app={app}
                  updateData={updateState}
                  agents={agents} 
                  getAgents={getAgents}
                  submit={submit}
                  namespace={"user_tasks_settings"}
              />
    }
  }

  return (

    <div>
      <ContentHeader 
        title={ "Bot default settings" }
        items={ []
            }
        tabsContent={tabsContent()}
      />

      <Content>
        {/*JSON.stringify(state)*/}
        {renderTabcontent()}
      </Content>
    </div>
  )
}

function UsersSettings({app, updateData, namespace, submit}){
  const [state, setState] = React.useState(app.userTasksSettings ||{});

  useEffect(()=>{
    updateData({users: state})
  }, [state])

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  function submitData(){
    const data = {[namespace]: state}
    submit(data)
  }

  return (
    <Grid container direction={"column"}>

      <Grid item>
        <Typography variant={"h4"}>
          When users start a conversation
        </Typography>

        <FormControlLabel
          control={
            <Checkbox checked={state.delay} 
            onChange={handleChange('delay')} value="delay" />
          }
          label="Leave a 2 minute delay before triggering Task Bots during office hours"
        />
      </Grid>

      <Grid item>
        <Button 
          color={"primary"}
          variant={"contained"}
          onClick={submitData}>
          save
        </Button>

      </Grid>

    </Grid>
  )
}

function LeadsSettings({app, updateData, agents, getAgents, submit, namespace}){

  const [state, setState] = React.useState(app.leadTasksSettings || {} );

  useEffect(()=>{
    updateData({leads: state})
  }, [state])

  const handleChange = name => event => {
    setValue(name, event.target.checked)
  };

  function handleRadioChange(event) {
    setValue(event.target.name, event.target.value);
  }

  const setValue = (name, value)=>{
    setState({ ...state, [name]: value });
  }

  function submitData(){
    const data = {[namespace]: state}
    submit(data)
  }

  return (
    <Grid container>

      <Grid item>
        <Typography variant={"h4"}>
          When leads start a conversation
        </Typography>

        <Grid container direction="column">

          <FormControlLabel
            control={
              <Checkbox 
                checked={state.delay} 
                onChange={handleChange('delay')} 
                value={state.delay} 
              />
            }
            label="Leave a 2 minute delay before triggering Task Bots during office hours"
          />

          <FormControlLabel
            control={
              <Checkbox 
                checked={state.share_typical_time} 
                onChange={handleChange('share_typical_time')} 
                value={state.share_typical_time} 
              />
            }
            label="Share your typical reply time"
          />

        </Grid>

        <Divider/>
        
        <Typography variant={"h5"}>
          Route existing customers to support
        </Typography>

        <Typography variant={"body1"}>
          Route leads to the right people by asking if they are an existing customer when they start a new conversation.      
        </Typography>

        <FormControl component="fieldset" margin={"normal"}>
          
          <FormLabel component="legend">
            What do you want to do when they choose "Yes, I'm a customer"?
          </FormLabel>

          <RadioGroup aria-label="position" 
            name="routing" 
            value={state.routing} 
            onChange={handleRadioChange} 
            >

            <Box pt={2} >
              <Grid container direction={"row"}>

                <FormControlLabel
                  value="assign"
                  control={<Radio color="primary" />}
                  label="Assign the conversation"
                  labelPlacement="end"
                />

                {
                  state.routing === "assign" && 
                  
                  <AgentSelector 
                    agents={agents} 
                    getAgents={getAgents}
                    setValue={setValue}
                    value={state.assignee}
                  />
                }
              
              </Grid>
            </Box>
            



            <FormControlLabel
              value="close"
              control={<Radio color="primary" />}
              label="Close the conversation"
              labelPlacement="end"
            />
          </RadioGroup>
        </FormControl>

        <Divider/>

        <Typography variant={"h5"}>
          Ask for contact details
        </Typography>

        <Typography variant={"body1"}>
          If we don’t already have their contact details, 
          Operator will suggest that customers leave their email 
          address or their phone number to get notified whenever 
          you reply.
        </Typography>

        <FormControl>
          <RadioGroup aria-label="position" 
            name="email_requirement" 
            value={state.email_requirement} 
            onChange={handleRadioChange} 
            >
            <FormControlLabel
              value="email_only"
              control={<Radio color="primary" />}
              label="Ask for email only"
              labelPlacement="end"
            />
            <FormControlLabel
              value="email_or_phone"
              control={<Radio color="primary" />}
              label="Ask for email or mobile number"
              labelPlacement="end"
            />
          </RadioGroup>
        </FormControl>
      </Grid>

      <Grid item>
        <Button 
          color={"primary"}
          variant={"contained"}
          onClick={submitData}>
          save
        </Button>
      </Grid>
    </Grid>
  )
}

function AgentSelector({agents, getAgents, setValue, value }){
  const [selected, setSelected] = React.useState(value)

  useEffect(() => {
    getAgents()
  }, [])

  useEffect(()=>{
    console.log("assignee", selected)
    setValue("assignee", selected)
  }, [selected])

  function handleChange(e){
    setSelected(e.target.value)
  }

  return (
    <div>
      <FormControl>
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
    </div>
  )
}

export default SettingsForm