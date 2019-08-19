import React, {Component, useState, useEffect} from 'react'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styled from '@emotion/styled'
import TextEditor from '../../textEditor'

import graphql from '../../graphql/client'
import {BOT_TASK, BOT_TASKS} from '../../graphql/queries'
import FormDialog from '../../components/FormDialog'

import {
  Box,
  Grid,
  Typography, 
  Paper,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Divider
} from '@material-ui/core'

import {
  DragHandle,
  DeleteForever,
  RemoveCircle
} from '@material-ui/icons'

import { makeStyles, createStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(1)
  }
}));

const pathsData = [
  {
    id: 1,
    title: "a",
    steps: [
      {
        id: 1,
        messages: [{
          app_user: {
            display_name: "miguel michelson",
            email: "miguelmichelson@gmail.com",
            id: 1,
            kind: "agent" 
          },
          serialized_content: '{"blocks":[{"key":"9oe8n","text":"por mail!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
          html_content: "hola", 
        }],
        controls: {
          type: "ask_option",
          schema: [
              {element: "button", label: "yes", next_step_uuid: 2},
              {element: "button", label: "no", next_step_uuid: 3},
              {element: "button", label: "maybe", next_step_uuid: 4}
            ]
        }
      }
    ],
  },
  {
    id: 2,
    title: "b",
    steps: [],
  },
  {
    id: 3,
    title: "c",
    steps: [],
  },
]

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
            <Button onClick={close} color="primary">
              Cancel
            </Button>

            <Button onClick={handleSubmit} zcolor="primary">
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

const BotContainer = (props)=>{
  const [paths, setPaths] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [isOpen, setOpen] = useState(false)

  const handleSelection = (item)=>{
    setSelectedPath(item)
  }

  useEffect(() => {
    graphql(BOT_TASK, {appKey: props.app.key, id: "1"}, {
      success: (data)=>{
        setPaths(data.app.botTask.paths)
        setSelectedPath(data.app.botTask.paths[0])
      },
      error: (err)=>{
        debugger
      }
    })
  }, []);

  const addSectionMessage = (path)=>{

    const dummy = { id: 1,
      step_uid: create_UUID(),
      type: "messages",
      messages: [{
        app_user: {
          display_name: "miguel michelson",
          email: "miguelmichelson@gmail.com",
          id: 1,
          kind: "agent" 
        },
        serialized_content: '{"blocks":[{"key":"9oe8n","text":"uno nuevoooo","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        html_content: "hola", 
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
    const dummy = { 
      id: 1,
      step_uid: create_UUID(),
      type: "messages",
      messages: [],
      controls: {
        type: "ask_option",
        schema: [
          {element: "button", label: "write here", next_step_uuid: null},
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
    const dummy = { 
      id: 1,
      step_uid: create_UUID(),
      messages: [],
      controls: {
        type: "data_retrieval",
        schema: [
          {
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


  return (
    <Grid container alignContent={'space-around'} justify={'space-around'}>
    
      {
        isOpen && <PathDialog 
          isOpen={isOpen} 
          open={open} 
          close={close}
          submit={addEmptyPath}
        />
      }

      <Grid item xs={2}>
        <Paper>
          <List component="nav" aria-label="path list">
            {
              paths.map((o)=>( <PathList
                path={o}
                handleSelection={handleSelection}
                /> ))
            }
          </List>
          <Button onClick={showPathDialog}>add new path</Button>
        </Paper>

      </Grid>

      <Grid item xs={8}>

        <Paper>

          {
            selectedPath && <Path
              path={selectedPath}
              paths={paths}
              addSectionMessage={addSectionMessage}
              addSectionControl={addSectionControl}
              addDataControl={addDataControl}
              updatePath={updatePath}
              />
          }

        </Paper>

      </Grid>
    
    </Grid>
    
    
  )
}

const PathList = ({path, handleSelection})=>{
  return <ListItem button onClick={(e)=> handleSelection(path)}>
          <ListItemText primary={path.title} />
        </ListItem>
}

const Path = ({paths, path, addSectionMessage, addSectionControl, addDataControl, updatePath})=>{

  const addStepMessage = (path)=>{
    addSectionMessage(path)
  }

  const deleteItem = (path, step)=>{
    const newSteps = path.steps.filter((o, i)=> o.step_uid != step.step_uid  )
    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)
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

  return (

    <Box p={2}>

      <Box p={2}>

        <Grid container>

          <Grid item xs={8}>

            <TextField 
              value={path.title}
              onChange={handleTitleChange}
              fullWidth={true}
              helperText={"path title"}
            />

          </Grid>

          <Grid item xs={4}>
            <Button color={"primary"} variant={"contained"}>
              save
            </Button>

            <Button color={"default"} variant={"contained"}>
              set live
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

      <Grid container spacing={2} justify={"space-around"}>

        
        <Button variant={"outlined"} onClick={()=> addStepMessage(path)}>
          Add Message Bubble
        </Button>

        <Button variant={"outlined"} onClick={()=> addSectionControl(path)}>
          Add Message input
        </Button>

        <Button variant={"outlined"} onClick={()=> addDataControl(path)}>
          Add Data input
        </Button>
  
      </Grid>

      </Box>

  )
}

const PathEditor = ({step, message, path, updatePath })=>{

  const classes = useStyles();

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

  return (
    <Paper
      elevation={1} 
      square={true} 
      classes={{root: classes.root}}>
      <TextEditor 
          //uploadHandler={this.uploadHandler}
          serializedContent={message.serialized_content}
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

// APp Package Preview
const AppPackageBlocks = ({options, controls, path, step, update})=>{
  const {schema, type} = controls


  const updateOption = (value, option)=>{
    const newOption = Object.assign({}, option, {next_step_uuid: value})
    const newOptions = controls.schema.map((o)=> o.label === newOption.label ? newOption : o)
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
    const item = {label: "example", element: "button", next_step_uuid: null}
    const newControls = Object.assign({}, 
      step.controls, 
      { schema: step.controls.schema.concat( item , step) }
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
    const options = paths.map((o)=> ({value: o.id, label: o.title}))
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

                      <ItemManagerContainer>
                      
                        {
                          item.messages.map(
                            (message)=> 
                            <div>
                              
                              <PathEditor 
                                path={path}
                                step={item} 
                                message={message}
                                updatePath={updatePath}
                              />
                              
                            </div>
                          )
                        }
                        

                        {/*JSON.stringify(item.controls)*/}


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
                              <Button variant={'outlined'} size={"small"}>
                                + add data button
                              </Button>
                            </Grid> 
                        }

                      </Grid>


                      </ItemManagerContainer>

                      <ItemButtons {...provided.dragHandleProps}>

                        <DragHandle/>

                        <IconButton onClick={()=> deleteItem(path, item) }>
                          <DeleteForever/>
                        </IconButton>
                      </ItemButtons>

                      <Divider/>
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

export default withRouter(connect(mapStateToProps)(BotContainer))