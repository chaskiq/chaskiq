import React, {useState, useEffect} from 'react'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import TextEditor from '../textEditor'

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

const BotContainer = (props)=>{
  const [paths, setPaths] = useState(pathsData)
  const [selectedPath, setSelectedPath] = useState(pathsData[0])

  const handleSelection = (item)=>{
    setSelectedPath(item)
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
        </Paper>

      </Grid>

      <Grid item xs={8}>

        <Paper>

        {
          <Path
            path={selectedPath}
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

const Path = ({path})=>{

  return (

    <div>
      <h2>{path.id}</h2>
      -----

      {
        path.steps.map((step)=>(
          step.messages.map((message)=> <PathEditor 
            path={path}
            step={step} 
            message={message}
          />)
          )
        )
      }

      <Button onClick={addMessage}>
        Add Message Bubble
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
