import React, {Component, useState, useEffect} from 'react'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styled from '@emotion/styled'
import TextEditor from '../../textEditor'

import graphql from '../../graphql/client'
import {BOT_TASK, BOT_TASKS, AGENTS, BOT_TASK_METRICS} from '../../graphql/queries'
import {UPDATE_BOT_TASK} from '../../graphql/mutations'
import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'
import FormDialog from '../../components/FormDialog'
import Segment from './segment'
import SettingsForm from './settings'
import BotTaskSetting from './taskSettings'
import ContextMenu from '../../components/ContextMenu'
import ListMenu from '../../components/ListMenu'
import {errorMessage, successMessage} from '../../actions/status_messages'

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography' 
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Divider from '@material-ui/core/Divider'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import MuiSwitch from '@material-ui/core/Switch'
import Fab from '@material-ui/core/Fab'

import AddIcon from '@material-ui/icons/Add'
import DragHandle from '@material-ui/icons/DragHandle'
import DeleteForever from '@material-ui/icons/DeleteForever'
import RemoveCircle from '@material-ui/icons/RemoveCircle'
import DeleteForeverRounded from '@material-ui/icons/DeleteForeverRounded'

import { makeStyles, createStyles } from '@material-ui/styles';
import {isEmpty} from 'lodash'
import Stats from '../../components/stats'
import { setCurrentSection, setCurrentPage } from '../../actions/navigation'


const useStyles = makeStyles((theme) => createStyles({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(1),
    background: theme.palette.common.white,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardPaper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  }
}));

const ItemManagerContainer = styled.div`
  flex-grow: 4;
  margin-right: 19px;
`

const ItemButtons = styled.div`
  align-self: center;
  /* width: 203px; */
  align-items: center;
  display: flex;
  flex-grow: 1;

  justify-content: ${(props)=> props.first ? 'flex-start' : 'flex-end'};
`

const TextEditorConainer = styled.div`
  border: 1px solid #ccc;
  padding: 1em;
`

const ControlWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-flow: column;
`

function create_UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

const configFields =  [
  {name: "name", type: 'string', grid: {xs: 12, sm: 12 } } ,
  {name: "description", type: 'text', grid: {xs: 12, sm: 12 } },
]


const PathDialog = ({open, close, isOpen, submit})=>{

  let titleRef = React.createRef();
  //const titleRef = null

  const handleSubmit = ()=>{
    submit({
      id: create_UUID(),
      title: titleRef.value,
      steps: []
    })
  }

  return (
    isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Create Path"}
        formComponent={
            <form >
             
              <TextField
                label="None"
                id="title"
                inputRef={ref => titleRef = ref }
                placeholder={'write path title'}
                //defaultValue="Default Value"
                //className={classes.textField}
                helperText="Some important text"
              />

            </form>

        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} color="secondary">
              Cancel
            </Button>

            <Button onClick={handleSubmit} color="primary">
              Create
            </Button>
          </React.Fragment>
        }
        //actions={actions} 
        //onClose={this.close} 
        //heading={this.props.title}
        >
      </FormDialog>
    )
  )
}

const BotEditor = ({match, app, dispatch, mode, actions})=>{
  const [botTask, setBotTask] = useState({})
  const [errors, setErrors] = useState({})
  const [paths, setPaths] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [isOpen, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [changed, setChanged] = useState(null)

  const classes = useStyles();


  const handleSelection = (item)=>{
    setSelectedPath(item)
  }

  useEffect(() => {
    graphql(BOT_TASK, {appKey: app.key, id: match.params.id}, {
      success: (data)=>{
        setBotTask(data.app.botTask)
        setPaths(data.app.botTask.paths)
        setSelectedPath(data.app.botTask.paths[0])
      },
      error: (err)=>{
        debugger
      }
    })

    dispatch(setCurrentSection("Bot"))
    dispatch(setCurrentPage(`bot${mode}`))
  }, []);

  const saveData = ()=>{

    graphql(UPDATE_BOT_TASK, {
      appKey: app.key, 
      id: match.params.id, 
      params: {
        paths: paths,
        segments: botTask.segments,
        title: botTask.title,
        scheduling: botTask.scheduling,
        state: botTask.state,
        urls: botTask.urls
      }
    }, {
      success: (data)=>{
        setPaths(data.updateBotTask.botTask.paths)
        setErrors(data.updateBotTask.botTask.errors)
        setSelectedPath(data.updateBotTask.botTask.paths[0])
        dispatch(successMessage("bot updated"))
      },
      error: (err)=>{
        dispatch(errorMessage("bot not updated"))
      }
    })

  }

  const addSectionMessage = (path)=>{

    const dummy = {
      step_uid: create_UUID(),
      type: "messages",
      messages: [{
        app_user: {
          display_name: "bot",
          email: "bot@chasqik.com",
          id: 1,
          kind: "agent" 
        },
        serialized_content: '{"blocks":[{"key":"9oe8n","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        html_content: "--***--", 
      }]
    }

    const newSteps = path.steps.concat(dummy)
    let newPath = null
    
    const newPaths = paths.map((o)=>{
      if(o.id === path.id){
        newPath = Object.assign({}, path, {steps: newSteps })
        return newPath
      } else {
        return o
      }
    })
    console.log(newPaths)
    setPaths(newPaths)
    setSelectedPath(newPath) // redundant
  }

  const addSectionControl = (path)=>{
    const id = create_UUID()
    const dummy = { 
      step_uid: id,
      type: "messages",
      messages: [],
      controls: {
        type: "ask_option",
        schema: [
          {id: create_UUID(), element: "button", label: "write here", next_step_uuid: null},
          //{element: "button", label: "quiero contratar el producto", next_step_uuid: 3},
          //{element: "button", label: "estoy solo mirando", next_step_uuid: 4}
        ]
      }
    }

    const newSteps = path.steps.concat(dummy)
    let newPath = null

    const newPaths = paths.map((o)=>{
      if(o.id === path.id){
        newPath = Object.assign({}, path, {steps: newSteps })
        return newPath
      } else {
        return o
      }
    })
    
    setPaths(newPaths)
    setSelectedPath(newPath) // redundant
  }

  const addDataControl = (path)=>{
    const id = create_UUID()
    const dummy = { 
      step_uid: id,
      messages: [],
      controls: {
        type: "data_retrieval",
        schema: [
          {
            id: create_UUID(),
            element: "input", 
            type:"text", 
            placeholder: "enter email", 
            name: "email", 
            label: "enter your email",
          },
        ]
      }
    }

    const newSteps = path.steps.concat(dummy)
    let newPath = null

    const newPaths = paths.map((o)=>{
      if(o.id === path.id){
        newPath = Object.assign({}, path, {steps: newSteps })
        return newPath
      } else {
        return o
      }
    })
 
    setPaths(newPaths)
    setSelectedPath(newPath) // redundant
  }

  const addPath = (path)=>{
    const newPaths = paths.concat(path)
    setPaths(newPaths)
  }

  const addEmptyPath = (data)=>{
    addPath(data)
    close()
  }

  const updatePath = (path)=>{
    const newPaths = paths.map((o)=> o.id === path.id ? path : o )
    setPaths(newPaths)
    setSelectedPath(newPaths.find((o)=> o.id === path.id )) // redundant
  }

  const open  = () => setOpen(true);
  const close = () => setOpen(false);

  const showPathDialog = ()=>{
    setOpen(true)
  }

  const handleTabChange = (e, i)=>{
    setTabValue(i)
  }

  const tabsContent = ()=>{
    return <Tabs value={tabValue} 
              onChange={handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="Stats" />
              <Tab textColor="inherit" label="Settings" />
              <Tab textColor="inherit" label="Audience" />
              <Tab textColor="inherit" label="Editor" />
            </Tabs>
  }

  const getStats = (params, cb)=>{
    graphql(BOT_TASK_METRICS, params, {
      
      success: (data)=>{
        const d = data.app.botTask
        cb(d)
      },
      error: (error)=>{

      }
    })
  }

  const renderTabcontent = ()=>{
    switch (tabValue){
      case 0:
        return !isEmpty(botTask) && <Stats  match={match}
                                            app={app} 
                                            data={botTask}
                                            getStats={getStats}
                                            actions={actions}
                                            mode={'counter_blocks'}
                                            />
      case 1:
        return <BotTaskSetting 
                app={app} 
                data={botTask}
                updateData={setBotTask}
                saveData={saveData}
                errors={errors}
              />
      case 2:
        return <Segment 
          app={app} 
          data={botTask}
          updateData={(task)=>{ 
            setBotTask(task);
          }}
          handleSave={(segments)=>{
            setBotTask(Object.assign({}, botTask, {segments: segments}))
            saveData()
          }}
          />
      case 3:
        return renderEditor()
    }
  }

  const renderEditor = ()=>{
    return <Grid container 
            alignContent={'space-around'} 
            justify={'space-around'}>
      
    {
      isOpen && <PathDialog 
        isOpen={isOpen} 
        open={open} 
        close={close}
        submit={addEmptyPath}
      />
    }

    <Grid item xs={12} sm={2}>
      <List component="nav" aria-label="path list">
        {
          paths.map((o, i)=>( <PathList
            key={`path-list-${o.id}-${i}`}
            path={o}
            handleSelection={handleSelection}
            
            /> ))
        }
      </List>
      <Button 
        size="small"
        variant={"contained"} 
        onClick={showPathDialog}
        color="primary">
        <AddIcon />
        Add new path
      </Button>
    </Grid>

    <Grid item xs={12} sm={10}>

      <Paper className={classes.paper}>

        {
          selectedPath && <Path
            app={app}
            path={selectedPath}
            paths={paths}
            addSectionMessage={addSectionMessage}
            addSectionControl={addSectionControl}
            addDataControl={addDataControl}
            updatePath={updatePath}
            saveData={saveData}
            setPaths={setPaths}
            setSelectedPath={setSelectedPath}
            />
        }


        <Box m={2}>
          <Button                     
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={saveData}> 
            save data 
          </Button>

        </Box>

      </Paper>

    </Grid>

  
  </Grid>
  }

  const toggleState = ()=>{

  }

  return (
    <div>
      <ContentHeader 
        title={ botTask.title }
        items={ []
          /*[
          <MuiSwitch
            color={"default"}
            checked={botTask.state === "enabled"}
            onChange={toggleState}
            value={botTask.state}
            inputProps={{ 'aria-label': 'enable state checkbox' }}
          />,
          <Grid item>
            <Button                     
              variant="outlined" 
              color="inherit" 
              size="small" 
              onClick={saveData}> 
              save data 
            </Button>
          </Grid> , 
          <Grid item>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="small">
              set live
            </Button>
          </Grid>
        ]*/
        }
        tabsContent={tabsContent()}
      />

      <Content>
        {renderTabcontent()}
      </Content>
    
    </div>
  )
}

function FollowActionsSelect({app, path, updatePath}){
  const options = [
    {key: "close", name: "Close conversation", value: null },
    {key: "assign", name: "Assign Agent", value: null },
    //{action_name: "tag", value: null },
    //{action_name: "app_content", value: null },
  ]

  //console.log("PATH FOLLOW ACTIONS", path.followActions, path)

  const [selectMode, setSelectMode] = useState(null)
  const [actions, setActions] = useState(path.followActions || [])

  useEffect(()=>{
    updateData()
  }, [actions])

  useEffect(()=>{
    setActions(path.followActions || [])
  }, [path.id])

  function updateData(){
    if(!path) return 
    const newPath = Object.assign({}, path, {
      follow_actions: actions, 
      followActions: actions 
    })
    updatePath(newPath)
  }

  function renderAddButton(){
    return <Button 
            variant="outlined"
            onClick={()=>{setSelectMode(true)}}>
            add option
           </Button>
  }

  function handleClick(a){
    setActions(actions.concat(a))
  }

  function renderActions(){
    return actions.map((o, i)=> renderActionType(o, i))
  }

  function availableOptions(){
    if(actions.length === 0) return options
    return options.filter((o)=> !actions.find((a)=> a.key === o.key ))
  }

  function updateAction(action, index){
    const newActions = actions.map((o,i)=> i === index ? action : o )
    setActions(newActions)
  }

  function removeAction(index){
    const newActions = actions.filter((o,i)=> i != index )
    setActions(newActions)
  }

  function renderActionType(action, i){
    switch (action.key) {
      case "assign":
        return <AgentSelector app={app} 
                              index={i}
                              action={action}
                              updateAction={updateAction}
                              removeAction={removeAction}
                              key={action.key}>
                  {action.name}
                </AgentSelector>
    
      default: 
        return <Grid style={{display: 'flex'}} 
                     key={action.key} 
                     item 
                     alignItems={"center"}>
                <Typography >
                  {action.name}
                </Typography>
                <IconButton 
                  color={"secondary"}
                  onClick={()=> removeAction(i)}>
                  <DeleteForeverRounded/>
                </IconButton> 
               </Grid>
    }
  }


  const menuOptions = availableOptions()

  return(
   
    <div>
      {renderActions()}

      {
        menuOptions.length > 0 &&
          <ContextMenu
            label={"Add Follow Action"} 
            handleClick={handleClick} 
            actions={actions}
            options={menuOptions}
          /> 
      }

      {/*
        selectMode  ?
        
        :  
        renderAddButton()
      */}

      
    </div>
  )
}

function AgentSelector({app, updateAction, removeAction, action, index}){
  const [selected, setSelected] = React.useState(action.value)
  const [agents, setAgents] = React.useState([])
  const [mode, setMode] = React.useState("button")
 
  function getAgents(){
    graphql(AGENTS, {appKey: app.key }, {
      success: (data)=>{
        setAgents(data.app.agents)
      }, 
      error: (error)=>{
      }
    })
  }

  useEffect(() => {
    getAgents()
  }, [])

  useEffect(()=>{
    const agent = agents.find((o)=> selected === o.id)
    updateAction(Object.assign({}, action, {value: agent && agent.id}), index)
  }, [selected])

  function handleChange(e){
    setSelected(e.target.value)
    setMode("button")
  }

  function selectedAgent(){
    const agent = agents.find((o)=> selected === o.id)
    if(!agent) return ""
    return agent.name || agent.email
  }

  return (
    <div>

    {
      true ?
        <Grid container 
          alignItems={"flex-end"}
          //justify={"space-between"}
          >
          <Grid item>
            <FormControl>
              <InputLabel htmlFor="agent">
                Assignee Agent
              </InputLabel>
              <Select
                value={selected}
                onChange={handleChange}
                inputProps={{
                  name: 'agent',
                  id: 'agent',
                }}>

                {
                  agents.map((o)=>(
                    <MenuItem value={o.id}>
                      {o.email}
                    </MenuItem>
                  ))
                }
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <IconButton 
            color={"secondary"}
            onClick={()=> removeAction(index)}>
            <DeleteForeverRounded/>
          </IconButton> 
        </Grid>
      </Grid> : 

      <Grid style={{display: 'flex'}} 
                     key={action.key} 
                     item 
                     alignItems={"center"}>

        <Button onClick={()=> setMode('select')}>
          assign: {selectedAgent(selected)}
        </Button> 

        <IconButton 
          color={"secondary"}
          onClick={()=> removeAction(index)}>
          <DeleteForeverRounded/>
        </IconButton> 

      </Grid>
    }

    </div>
  )
}

const PathList = ({path, handleSelection})=>{
  return <ListItem button 
                   onClick={(e)=> handleSelection(path)} 
                   variant={"outlined"}>
          <ListItemText primary={path.title} />
        </ListItem>
}

const Path = ({
  paths, 
  path, 
  addSectionMessage, 
  addSectionControl, 
  addDataControl, 
  updatePath,
  setPaths,
  saveData,
  setSelectedPath,
  app
})=>{

  const addStepMessage = (path)=>{
    addSectionMessage(path)
  }

  const deleteItem = (path, step)=>{
    const newSteps = path.steps.filter((o, i)=> o.step_uid != step.step_uid  )
    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)
  }

  const deletePath = (path)=>{
    const newPaths = paths.filter((o)=> o.id != path.id)
    console.log(newPaths)
    setPaths(newPaths)
    setSelectedPath(null)
  }

  const onDragEnd = (path, result)=> {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newSteps = reorder(
      path.steps,
      result.source.index,
      result.destination.index
    );

    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)

  }

  const handleTitleChange = (e)=>{
    const value = e.target.value
    const newPath = Object.assign({}, path, {title: value})
    updatePath(newPath)
  }

  const options = [
      {name: "Add Message Bubble", key: "add-message", onClick: ()=>{ addStepMessage(path) }},
      {name: "Add path chooser", key: "add-path-choooser", onClick: ()=>{ addSectionControl(path) }},
      {name: "Ask data input",key: "ask-data-input", onClick: ()=>{ addDataControl(path) }}
  ]

  return (

    <Box p={2}>

      <Box p={2}>

        <Grid container spacing={3}>

          <Grid item xs={8}>

            <TextField 
              value={path.title}
              onChange={handleTitleChange}
              fullWidth={true}
              helperText={"path title"}
            />

          </Grid>

          <Grid item xs={4} alignItems="flex-end">
            <Button 
              variant="outlined"
              color="secondary"
              onClick={()=>deletePath(path)}>
              delete path
              <DeleteForeverRounded/>
            </Button>
          </Grid>

        </Grid>

        
      </Box>

      <SortableSteps 
        steps={path.steps}
        path={path}
        paths={paths}
        addSectionMessage={addSectionMessage}
        addSectionControl={addSectionControl}
        updatePath={updatePath}
        deleteItem={deleteItem}
        onDragEnd={onDragEnd}
      />

      {/*<Divider/>*/}

      <Grid container spacing={2} justify={"flex-start"}>
          <ListMenu 
            options={options}
            button={
              <Fab color="primary" size={"small"}
                aria-label="add">
                <AddIcon />
              </Fab>
            }
          />
      </Grid>

      <Divider variant="fullWidth" style={{marginTop: '3em'}}/>

      <Grid container
        style={{marginTop: '2em'}}>


        <Grid item alignContent={"flex-start"}>

          <Typography variant={'h5'}>
            Follow actions
          </Typography>

          <FollowActionsSelect 
            app={app} 
            updatePath={updatePath}
            path={path} 
          />  
          
          <Box mt={2}>
            <Typography variant="caption">
              Hint: Follow actions will be triggered on paths that ends with message bubbles.
              Paths that ends with path chooser will not trigger follow actions.
            </Typography>
          </Box>
        
        </Grid>

        

      </Grid>

    </Box>

  )
}

const PathEditor = ({step, message, path, updatePath })=>{

  const classes = useStyles();
  const [readOnly, setReadOnly] = useState(false)

  const saveHandler = (html, serialized)=>{
    console.log("savr handler", serialized)
  }

  const saveContent = ({html, serialized})=>{
    const newMessage = Object.assign({}, message, {
      serialized_content: serialized
    })

    const newSteps = path.steps.map((o)=>{ 
      return o.step_uid === step.step_uid ? 
      Object.assign({}, o, {messages: [newMessage]}) : o
    })

    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)
  }

  const uploadHandler = ({serviceUrl, imageBlock})=>{
    imageBlock.uploadCompleted(serviceUrl)
  }

  return (
    <Paper
      elevation={1} 
      square={true} 
      classes={{root: classes.root}}>
      <TextEditor 
          uploadHandler={uploadHandler}
          serializedContent={message.serialized_content}
          read_only={readOnly}
          toggleEditable={()=>{
            setReadOnly(!readOnly)
          }}
          data={
            {
              serialized_content: message.serialized_content
            }
          }
          styles={
            {
              lineHeight: '1.2em',
              fontSize: '1em'
            }
          }
          saveHandler={saveHandler} 
          updateState={({status, statusButton, content})=> {
            console.log("get content", content)
            saveContent(content )
          }
        }
      />
    </Paper>
  )
}

// APp Package Preview
const AppPackageBlocks = ({options, controls, path, step, update})=>{
  const {schema, type} = controls


  const updateOption = (value, option)=>{
    const newOption = Object.assign({}, option, {next_step_uuid: value})
    const newOptions = controls.schema.map((o)=> o.id === newOption.id ? newOption : o)
    const newControls = Object.assign({}, controls, {schema: newOptions})
    update(newControls)
  }

  const removeOption = (index)=>{
    const newOptions = controls.schema.filter( (o, i )=> i != index )
    const newControls = Object.assign({}, controls, {schema: newOptions})
    update(newControls)
  }

  const handleInputChange = (value, option, index)=>{
    const newOption = Object.assign({}, option, {label: value})
    const newOptions = controls.schema.map((o, i)=> i === index ? newOption : o)
    const newControls = Object.assign({}, controls, {schema: newOptions})
    update(newControls)
  }

  const renderElement = (item, index)=>{
    const element = item.element

    switch(item.element){
    case "separator":
      return <hr key={index}/>
    case "input":
      console.log("controls;", controls)
      return <div className={"form-group"} key={index}>
              {/*item.label ? <label>{item.label}</label> : null */}
              {/*<TextField 
                type={item.type} 
                name={item.name}
                placeholder={item.placeholder}
              />*/}
              <DataInputSelect 
                controls={controls}
                path={path}
                step={step}
                update={update}
                item={item}
                options={[
                  {value: "email", label: "email"},
                  {value: "name", label: "name"},
                  {value: "phone", label: "phone"},
                ]}/>

             </div>

    case "submit":
      return <button key={index} 
                     style={{alignSelf: 'flex-end'}} 
                     type={"submit"}>
                {item.label}
              </button>
    case "button":
      return <Grid container 
                spacing={2} 
                alignItems={"center"}>

                <Grid item xs={6}>
                
                  <TextField value={item.label} 
                    fullWidth={true}
                    onChange={(e)=> handleInputChange(e.target.value, item, index)} 
                  />

                </Grid>

                <Grid item xs={3}>
                  {
                    controls && controls.type === "ask_option" ?
                    
                    <PathSelect 
                      option={item} 
                      options={options} 
                      update={updateOption}
                    /> : null 
                  }
                </Grid>

                <Grid item xs={3}>
                  <IconButton onClick={()=> removeOption(index)}>
                    <RemoveCircle/>
                  </IconButton>
                </Grid>
            </Grid>
    default:
      return null
    }
  }

  const renderElements = ()=>{
    return schema.map((o, i)=>
      renderElement(o, i)
    )
  }

  return (renderElements())
}

// SORTABLE

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  display: 'flex',
  justifyContent: 'space-evenly',
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "transparent",
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "transparent",
  padding: grid,
  //width: 250
});

class SortableSteps extends Component {
  constructor(props) {
    super(props);
  }

  onDragEnd =(result)=> {
    this.props.onDragEnd(this.props.path, result)
  }

  updateControlPathSelector = (controls, step)=>{
    this.updateControls(controls, step)
  }

  appendItemControl = (step)=>{
    const item = {
      id: create_UUID(), 
      label: "example", 
      element: "button", 
      next_step_uuid: null
    }
    const newControls = Object.assign({}, 
      step.controls, 
      { 
        schema: step.controls.schema.concat( item , step),
        wait_for_input: true
      }
    )

    this.updateControls(newControls, step)
  }

  updateControls = (newControls, step)=>{
    const {path, updatePath} = this.props

    const newStep = Object.assign({}, step, {controls: newControls})

    const newSteps = path.steps.map((o)=>{ 
      return o.step_uid === newStep.step_uid ? newStep : o
    })

    const newPath = Object.assign({}, path, {steps: newSteps})

    updatePath(newPath)
  }

  render() {
    const {steps, path, paths, deleteItem, updatePath} = this.props
    const options = paths.map((o)=> ({
        value: o.steps[0] && o.steps[0].step_uid, 
        label: o.title
      })
    )
    
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {steps.map((item, index) => (
                <Draggable key={item.step_uid} 
                  draggableId={item.step_uid} 
                  index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}>

                      <ItemButtons first={true} 
                        {...provided.dragHandleProps}>
                        <DragHandle/>
                      </ItemButtons>

                      <ItemManagerContainer>
                      
                        {
                          item.messages.map(
                            (message)=>
                              <PathEditor 
                                path={path}
                                step={item} 
                                message={message}
                                updatePath={updatePath}
                              />
                          )
                        }
                        
                        <Grid container>

                          <Grid item xs={12}>
                            <ControlWrapper>
                              { item.controls && 
                                <AppPackageBlocks 
                                  controls={item.controls} 
                                  path={path}
                                  step={item}
                                  options={options}
                                  update={(opts)=> this.updateControlPathSelector(opts, item)}
                                /> 
                              }
                            </ControlWrapper>
                          </Grid>

                          {
                            item.controls && item.controls.type === "ask_option" &&
                          
                              <Grid 
                                item xs={12} 
                                onClick={()=> this.appendItemControl(item)}>
                                <Button 
                                  color={"primary"}
                                  variant={'outlined'} 
                                  size="small">
                                  + add data option
                                </Button>
                              </Grid> 
                          }

                        </Grid>

                      </ItemManagerContainer>

                      <ItemButtons>
                        <IconButton onClick={()=> deleteItem(path, item) }>
                          <DeleteForever/>
                        </IconButton>
                      </ItemButtons>

                    </div>


                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

const PathSelect = ({ option, options, update})=>{
  const handleChange = (e)=>{
    update(e.target.value, option)
  }
  const selectedOption = options.find((o)=> option.next_step_uuid === o.value )

  return (
    <Select
      value={ selectedOption ? selectedOption.value : '' }
      onChange={handleChange}
      fullWidth={true}
      /*inputProps={{
        name: 'age',
        id: 'age-simple',
      }}*/
    >
      {
        options.map((option)=> <MenuItem 
                                key={`path-select-${option.value}`}
                                value={option.value}>
                                {option.label}
                              </MenuItem> 
                    )
      }
    </Select>
  )

}

const DataInputSelect = ({item, options, update, controls, path, step})=>{
  
  const handleChange = (e)=>{
    const newOption = Object.assign({}, item, {name: e.target.value})
    //const newOptions = //controls.schema.map((o)=> o.name === newOption.name ? newOption : o)
    const newControls = Object.assign({}, controls, {schema: [newOption]})
    
    update(newControls)
  }

  return (
    <Select
      value={ item.name }
      onChange={handleChange}
      fullWidth={true}
      label={item.label}
      helperText={"oeoeoe"}
    >
      {
        options.map((option)=> <MenuItem 
                                value={option.value}>
                                {option.label}
                              </MenuItem> 
                    )
      }
    </Select>
  )
}

function mapStateToProps(state) {

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

export default withRouter(connect(mapStateToProps)(BotEditor))