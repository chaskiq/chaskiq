import React, {Component, useState, useEffect} from 'react'
import FieldRenderer from '../../shared/FormFields'
import {
  Grid,
  Button,
  Tabs,
  Tab,
  Typography,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormGroup,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  InputLabel,
  Select,
  MenuItem
} from '@material-ui/core'

import {toSnakeCase} from '../../shared/caseConverter'
import serialize from 'form-serialize'

import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'

import graphql from '../../graphql/client'
import {AGENTS} from '../../graphql/queries'

const SettingsForm = ({app, data, errors, updateData}) => {

  const [tabValue, setTabValue] = useState(0)
  const [state, setState] = useState({})

  const [agents, setAgents] = useState([])

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
                  updateData={updateState} 
                  agents={agents} 
                  getAgents={getAgents}
                />
      case 1:
        return <UsersSettings 
                  updateData={updateState}
                  agents={agents} 
                  getAgents={getAgents}
              />
    }
  }

  return (

    <div>
      <ContentHeader 
        title={ "dsdsfdfs" }
        items={ [<Grid item>
                  <Button variant={"outlined"} > save data </Button>
                </Grid> , 
                <Grid item>
                  <Button color={"default"} variant={"contained"}>
                    set live
                  </Button>
                </Grid>
              ]
            }
        tabsContent={tabsContent()}
      />

      <Content>
        {JSON.stringify(state)}
        {renderTabcontent()}
      </Content>
    </div>
  )
}


function UsersSettings({updateData}){
  const [state, setState] = React.useState({
    delay: true,
  });

  useEffect(()=>{
    updateData({users: state})
  }, [state])

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  return (
    <div>
      <Typography variant={"h5"}>
        When users start a conversation
      </Typography>

      <FormControlLabel
        control={
          <Checkbox checked={state.delay} 
          onChange={handleChange('delay')} value="delay" />
        }
        label="Leave a 2 minute delay before triggering Task Bots during office hours"
      />

    </div>
  )
}


function LeadsSettings({updateData, agents, getAgents}){

  const [state, setState] = React.useState({
    delay: true,
    routing: true,
    email_requirement: true,
    assignee: ""
  });

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

  return (
    <div>
      <Typography variant={"h4"}>
        When leads start a conversation
      </Typography>

      <FormControlLabel
        control={
          <Checkbox 
            //checked={state.delay} 
            onChange={handleChange('delay')} 
            value={state.delay} 
          />
        }
        label="Leave a 2 minute delay before triggering Task Bots during office hours"
      />

      <FormControlLabel
        control={
          <Checkbox 
            //checked={state.share_typical_time} 
            onChange={handleChange('share_typical_time')} 
            value={state.share_typical_time} 
          />
        }
        label="Share your typical reply time"
      />

      <Divider/>
      
      <Typography variant={"h5"}>
        Route existing customers to support
      </Typography>

      <Typography variant={"body1"}>
        Route leads to the right people by asking if they are an existing customer when they start a new conversation.      
      </Typography>

      <FormControl component="fieldset">
        <FormLabel component="legend">
          What do you want to do when they choose "Yes, I'm a customer"?
        </FormLabel>
        <RadioGroup aria-label="position" 
          name="routing" 
          value={state.routing} 
          onChange={handleRadioChange} 
          column>
          <FormControlLabel
            value="assign"
            control={<Radio color="primary" />}
            label="Assign the conversation"
            labelPlacement="right"
          />

          {
            state.routing === "assign" && 
            
            <AgentSelector 
              agents={agents} 
              getAgents={getAgents}
              setValue={setValue}
            />
          }

          <FormControlLabel
            value="close"
            control={<Radio color="primary" />}
            label="Close the conversation"
            labelPlacement="right"
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
          column>
          <FormControlLabel
            value="email_only"
            control={<Radio color="primary" />}
            label="Ask for email only"
            labelPlacement="right"
          />
          <FormControlLabel
            value="email_or_phone"
            control={<Radio color="primary" />}
            label="Ask for email or mobile number"
            labelPlacement="right"
          />
        </RadioGroup>
      </FormControl>

    </div>
  )
}

function AgentSelector({agents, getAgents, setValue}){
  const [selected, setSelected] = React.useState('')

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