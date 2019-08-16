import React, {useState, useEffect} from 'react'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import TextEditor from '../textEditor'

import graphql from '../graphql/client'
import {BOT_TASK, BOT_TASKS} from '../graphql/queries'

import {
  Box,
  Grid,
  Typography, 
  Paper,
  Button
} from '@material-ui/core'

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


function create_UUID(){
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

const BotContainer = (props)=>{
  const [paths, setPaths] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)

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
          {element: "button", label: "quiero saber como funciona", next_step_uuid: 2},
          {element: "button", label: "quiero contratar el producto", next_step_uuid: 3},
          {element: "button", label: "estoy solo mirando", next_step_uuid: 4}
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
    console.log(newPaths)
    setPaths(newPaths)
    setSelectedPath(newPath) // redundant
  }

  const addPath = (path)=>{
    const newPaths = paths.concat(path)
    setPaths(newPaths)
  }

  const addEmptyPath = ()=>{
    const path = {
      id: "ssssmsk",
      steps: []
    }
    addPath(path)
  }

  const updatePath = (path)=>{
    console.log(path)
    
    const newPaths = paths.map((o)=> o.id === path.id ? path : o )
    setPaths(newPaths)
    setSelectedPath(newPaths.find((o)=> o.id === path.id )) // redundant
  }

  return (
    <Grid container alignContent={'space-around'} justify={'space-around'}>
    
      <Grid item xs={2}>
        <Paper>
        {
          paths.map((o)=>( <PathList
            path={o}
            handleSelection={handleSelection}
            /> ))
        }

        <Button onClick={addEmptyPath}>add new path</Button>
        </Paper>

      </Grid>

      <Grid item xs={8}>

        <Paper>

        {
          selectedPath && <Path
            path={selectedPath}
            addSectionMessage={addSectionMessage}
            addSectionControl={addSectionControl}
            updatePath={updatePath}
            />
        }

        </Paper>

      </Grid>
    
    </Grid>
    
    
  )
}

const PathList = ({path, handleSelection})=>{
  return <div onClick={(e)=> handleSelection(path)}>
    <Typography >{path.title}</Typography>

    title: {path.title}
  </div>
}

const Path = ({path, addSectionMessage, addSectionControl, updatePath})=>{

  const addStepMessage = (path)=>{
    addSectionMessage(path)
  }

  const deleteItem = (path, step)=>{
    const newSteps = path.steps.filter((o, i)=> o.step_uid != step.step_uid  )
    const newPath = Object.assign({}, path, {steps: newSteps})
    updatePath(newPath)
  }

  return (

    <div>
      <h2>{path.id}</h2>
      -----

      {
        path.steps.map((step, index)=>(
          <div key={`step-${step.step_uid}`}>
            section {index} {step.step_uid}:
            {
              step.messages.map(
                (message)=> 
                <div>
                  
                  <PathEditor 
                    path={path}
                    step={step} 
                    message={message}
                  />
                  
                </div>
              )
            }

            {JSON.stringify(step.controls)}

            <Button onClick={()=> deleteItem(path, step) }>
              delete item
            </Button>

            <hr/>
          </div>
          )
        )
      }

      <Button onClick={()=> addStepMessage(path)}>
        Add Message Bubble
      </Button>

      <Button onClick={()=> addSectionControl(path)}>
        Add Message input
      </Button>
    </div>

  )
}

const PathEditor = ({step, message, path})=>{

  const saveHandler = (html, serialized)=>{
  }

  const saveContent = ({html, serialized})=>{
    console.log("guarda", serialized)
  }

  return (
    <div>
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
              lineHeight: '2em',
              fontSize: '1.2em'
            }
          }
          saveHandler={saveHandler} 
          updateState={({status, statusButton, content})=> {
            console.log("get content", content)
            saveContent(content )
          }
        }
      />
    </div>
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

export default withRouter(connect(mapStateToProps)(BotContainer))
