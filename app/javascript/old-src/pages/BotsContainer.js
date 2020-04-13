import React, {Component, useState, useEffect} from 'react'
import { withRouter, Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'

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
import Divider from '@material-ui/core/Divider'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Table from '../components/table/index'

import {AnchorLink} from '../shared/RouterLink'
import { makeStyles, createStyles } from '@material-ui/styles';
import graphql from '../graphql/client';
import {BOT_TASK, BOT_TASKS} from '../graphql/queries'
import {
  CREATE_BOT_TASK, 
  DELETE_BOT_TASK,
} from '../graphql/mutations'

import BotEditor from './bots/editor'
import FormDialog from '../components/FormDialog'

import SettingsForm from './bots/settings'
import EmptyView from '../components/emptyView'
import DeleteDialog from '../components/deleteDialog'
import {successMessage} from '../actions/status_messages'
import { setCurrentSection, setCurrentPage } from '../actions/navigation'

const useStyles = makeStyles((theme) => createStyles({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(1)
  }
}));

const BotDataTable = ({app, match, history, mode, dispatch})=>{
  const [loading, setLoading] = useState(false)
  const [botTasks, setBotTasks] = useState([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null)
  const [openTaskForm, setOpenTaskForm] = useState(false)
  const [meta, setMeta] = useState({})

  function init(){

    dispatch(setCurrentPage(`bot${mode}`))

    graphql(BOT_TASKS, {
      appKey: app.key,
      mode: mode
    },{
      success: (data)=>{
        setBotTasks(data.app.botTasks)
      },
      error: ()=>{
        debugger
      }
    })
  } 

  useEffect(init, [match.url])

  //useEffect(init [match])

  function removeBotTask(o){
    graphql(DELETE_BOT_TASK, {appKey: app.key, id: o.id},{
      success: (data)=>{
        const newData = botTasks.filter((item)=> (item.id != o.id))
        setBotTasks(newData)
        setOpenDeleteDialog(null)
        dispatch(successMessage("bot removed"))
      },
      error: ()=>{
        debugger
      }
    })
  }

  function toggleTaskForm(){
    setOpenTaskForm(!openTaskForm)
  }

  return (

    <div>

      <ContentHeader 
        title={ mode }
        items={ <Grid item>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="small"
                    onClick={toggleTaskForm}> 
                    new Task 
                  </Button>
                </Grid> 
            }
        tabsContent={null}
      />

      <Content>
        {
          !loading && botTasks.length > 0 &&
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
               {field: 'actions', title: 'actions',
                render: row => <Button 
                                    color={"secondary"}
                                    variant={"contained"}
                                    onClick={()=> setOpenDeleteDialog(row)}>
                                  remove
                               </Button> 
              },
               
             ]}
           >
             
           </Table>
       }

       {
        !loading && botTasks.length === 0 && 
      
          <EmptyView 
            title={"No bot tasks found"} 
            subtitle={
              <div>
                create a new one 
                <Button 
                    variant="text" 
                    color="inherit" 
                    size="small"
                    onClick={toggleTaskForm}> 
                    here
                  </Button>
              </div>
            }/> 

       }


       {
         openDeleteDialog && <DeleteDialog 
          open={openDeleteDialog}
          title={`Delete bot "${openDeleteDialog.title}"`} 
          closeHandler={()=>{
            console.log("delete handler")
            setOpenDeleteDialog(null)
          }}
          deleteHandler={()=> { 
            removeBotTask(openDeleteDialog)
           }}>
          <Typography variant="subtitle2">
            we will destroy any content and related data
          </Typography>
        </DeleteDialog>
       }

      </Content>


      {
        openTaskForm ? 
        <BotTaskCreate 
          mode={mode}
          match={match}
          history={history}
          app={app}
          submit={()=> console.log("os")}
        /> : null
      }

    </div>
  )
}

const BotTaskCreate = ({app, submit, history, match, mode})=>{
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
      paths: [],
      type: mode
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
            <Button onClick={close} color="secondary">
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

const BotContainer = ({app, match, history, dispatch, actions})=>{

  useEffect( ()=>{
    dispatch(setCurrentSection("Bot"))
  } , [])

  return  (

    <Switch>
      
      <Route exact path={[`${match.path}/settings`]}
        render={(props) => (
          <SettingsForm 
              app={app} 
              history={history}
              match={match}
              dispatch={dispatch}
              {...props}
            />
          )} 
      />

      <Route exact path={[`${match.path}/users`]}
        render={(props) => (
          <BotDataTable app={app} 
              history={history}
              match={match}
              mode={"users"}
              dispatch={dispatch}
              {...props}
            />
          )} 
      />

      <Route exact path={[`${match.path}/leads`]}
      render={(props) => (
        <BotDataTable app={app} 
            history={history}
            match={match}
            mode={"leads"}
            dispatch={dispatch}
            {...props}
          />
        )} 
    />

    <Route exact path={[`${match.path}/leads/:id`]}
      render={(props) => {
          return <BotEditor app={app} 
                      mode={"leads"}
                      match={match} 
                      actions={actions}
                      {...props}
                  />
      }} 
    /> 

    <Route exact path={`${match.path}/users/:id`}
    render={(props) => {
        return <BotEditor app={app} 
                  mode={"users"}
                  match={match} 
                  {...props}
                />
    }} 
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