import React, {Component, useState, useEffect} from 'react'
import { withRouter, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'

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

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Table from '../components/table/index'

import {AnchorLink} from '../shared/RouterLink'
import { makeStyles, createStyles } from '@material-ui/styles';
import graphql from '../graphql/client';
import {BOT_TASK, BOT_TASKS} from '../graphql/queries'
import {CREATE_BOT_TASK} from '../graphql/mutations'

import BotEditor from './bots/editor'
import FormDialog from '../components/FormDialog'


const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(1)
  }
}));

const BotDataTable = ({app, match, history})=>{
  const [loading, setLoading] = useState(false)
  const [botTasks, setBotTasks] = useState([])
  const [openTaskForm, setOpenTaskForm] = useState(false)
  const [meta, setMeta] = useState({})
  const init = ()=>{
    graphql(BOT_TASKS, {appKey: app.key},{
      success: (data)=>{
        setBotTasks(data.app.botTasks)
      },
      error: ()=>{
        debugger
      }
    })
  } 

  useEffect(init, [])

  const toggleTaskForm = ()=>{
    setOpenTaskForm(!openTaskForm)
  }

  console.log(history)

  return (

    <div>

      <ContentHeader 
        title={ 'title' }
        items={ <Grid item>
                  <Button onClick={toggleTaskForm}> new Task </Button>
                </Grid> 
            }
        tabsContent={null}
      />

      <Content>
        {
          !loading && botTasks.length > 0 ?
           <Table
             meta={meta}
             data={botTasks}
             title={"Bot Tasks"}
             defaultHiddenColumnNames={[]}
             search={init}
             columns={[
               {field: 'name', title: 'name', 
                 render: row => (row ? <AnchorLink to={`${match.url}/${row.id}`}>
                                             {row.title}
                                           </AnchorLink> : undefined)
               },

               {field: 'state', title: 'state'},
               
             ]}
           >
             
           </Table>

           : null 
       }

      </Content>


      {
        openTaskForm ? 
        <BotTaskCreate 
          match={match}
          history={history}
          app={app}
          submit={()=> console.log("os")}
        /> : null
      }

    </div>
  )
}

const BotTaskCreate = ({app, submit, history, match})=>{
  //const PathDialog = ({open, close, isOpen, submit})=>{

  const [isOpen, setIsOpen] = useState(true)
  
  const close = ()=>{
    setIsOpen(false)
  }

  let titleRef = React.createRef();
  //const titleRef = null
  
  const handleSubmit = (e)=>{

    const dataParams = {
      //id: create_UUID(),
      title: titleRef.value,
      paths: []
    }

    graphql(CREATE_BOT_TASK, {
      appKey: app.key,
      params: dataParams
    }, {
      success: (data)=>{
        history.push(match.url + "/" + data.createBotTask.botTask.id)
        submit && submit()
      },
      error: (error)=>{
        debugger
      }
    })
  
  }
  
  return (
    isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Create Bot task"}
        formComponent={
            <form >
              
              <TextField
                label="None"
                id="title"
                inputRef={ref => titleRef = ref }
                placeholder={'write task title'}
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

            <Button onClick={handleSubmit} color="primary">
              Create
            </Button>
          </React.Fragment>
        }
        >
      </FormDialog>
    )
  )
}

const BotContainer = ({app, match, history})=>{
  console.log(history)

  return  (

    <Switch>
      
      <Route exact path={`${match.path}`}
          render={(props) => (
            <BotDataTable app={app} 
            history={history}
            match={match}/>
        )} 
      /> 

      <Route exact path={`${match.path}/:id`}
        render={(props) => (
            <BotEditor app={app} match={match}/>
        )} 
      /> 
    </Switch>

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