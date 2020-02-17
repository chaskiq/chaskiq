import React, {
  useState, 
  useEffect, 
  useRef
} from 'react'

import {
  camelizeKeys
} from '../actions/conversation'

import {isEmpty} from 'lodash'

import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';


import Progress from '../shared/Progress'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import FormDialog from '../components/FormDialog'
import FieldRenderer from '../shared/FormFields'
import DeleteDialog from "../components/deleteDialog"

import {errorMessage, successMessage} from '../actions/status_messages'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";

import graphql from '../graphql/client'
import {
  EVENT_TYPES,
  OUTGOING_WEBHOOKS
} from '../graphql/queries'
import {
  WEBHOOK_CREATE,
  WEBHOOK_UPDATE,
  WEBHOOK_DELETE
} from '../graphql/mutations' 
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import serialize from 'form-serialize'


function Integrations({app, dispatch}){

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventTypes, setEventTypes] = useState([])
  const [errors, setErrors] = useState([])
  const [webhooks, setWebhooks] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const form = useRef(null);

  useEffect(()=>{
    dispatch(setCurrentSection("Settings"))
    dispatch(setCurrentPage("webhooks"))
    getEventTypes()
    getWebhooks()
  }, [])

  function getEventTypes(){
    graphql(EVENT_TYPES, {appKey: app.key}, {
      success: (data)=>{
        const types = data.app.eventTypes.map((o)=> (
          {label: o.identifier, value: o.name}
          )
        )
        setEventTypes(types) 
      }, 
      error: (data)=>{
        debugger
      }
    })
  }

  function getWebhooks(){
    setLoading(true)

    setWebhooks([])

    graphql(OUTGOING_WEBHOOKS, {
      appKey: app.key 
    }, {
      success: (data)=>{
        setWebhooks(data.app.outgoingWebhooks)
        setLoading(false)
      }, 
      error: ()=>{
        setLoading(false)
      }
    })
  }

  function handleOpen(service){
    setOpen(service)
  }

  function close(){
    setOpen(false)
  }

  function submit(){
    const serializedData = serialize(form.current, { 
      hash: true, empty: true 
    })
    
    open.id ?
    updateWebhook(serializedData) :
    createWebhook(serializedData)
  }

  function definitions(){
    return [
      {
        name: 'url',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      { 
        name: 'enabled',
        type: 'bool',
        label: 'enable webhook',
        grid: { xs: 12, sm: 6 } 
      },
      {
        name: "tag_list",
        type: 'select',
        multiple: true,
        options: eventTypes,
        grid: { xs: 12, sm: 12 }
      }
    ]
  }

  function newWebhook(){
    setOpen({
      name: "webhook",
      tag_list: [],
      description: 'Outgoing webhook',
      state: 'disabled',
      enabled: false,
      definitions: definitions()
    })
  }

  function createWebhook(serializedData){
    const {url, tag_list, enabled} = serializedData.app
    graphql(WEBHOOK_CREATE, {
      appKey: app.key,
      url: url,
      state: enabled,
      tags: tag_list.split(",")
    }, {
      success: (data)=>{
        setTabValue(0)
        const webhook = data.createWebhook.webhook
        const errors = data.createWebhook.errors
        if(!isEmpty(errors)) {
          setErrors(errors)
          return
        }
        
        const newIntegrations = webhooks.concat(webhook)
        
        setWebhooks(newIntegrations)

        setOpen(null)
        dispatch(successMessage("webhook created"))
      },
      error: ()=>{
        dispatch(errorMessage("error adding webhook"))
      }
    })
  }

  function updateWebhook(serializedData){
    const {url, tag_list, enabled} = serializedData.app
    graphql(WEBHOOK_UPDATE, {
      appKey: app.key,
      appPackage: open.name,
      id: parseInt(open.id),
      url: url,
      state: enabled,
      tags: tag_list.split(",")
    }, {
      success: (data)=>{
        setTabValue(0)
        const webhook = data.updateWebhook.webhook
        const errors = data.updateWebhook.errors
        if(!isEmpty(errors)) {
          setErrors(errors)
          return
        }
        const newIntegrations = webhooks.map(
          (o)=> o.id === webhook.id ? webhook : o
        )
        setWebhooks(newIntegrations)
        //getAppPackageIntegration()
        setOpen(null)
        dispatch(successMessage("webhook updated"))
      },
      error: ()=>{
        dispatch(errorMessage("error updating webhook"))
      }
    })
  }

  function removeWebhook(){
    graphql(WEBHOOK_DELETE, {
      appKey: app.key,
      id: parseInt(openDeleteDialog.id),
    }, {
      success: (data)=>{
        setTabValue(0)
        const webhook = data.deleteWebhook.webhook
        const newIntegrations = webhooks.filter(
          (o)=> o.id != webhook.id
        )
        const errors = data.deleteWebhook.errors
        if(!isEmpty(errors)) {
          setErrors(errors)
          return
        }
        setWebhooks(newIntegrations)
        setOpen(null)
        setOpenDeleteDialog(null)
        dispatch(successMessage("webhook removed correctly"))
      },
      error: ()=>{
        dispatch(errorMessage("error removing webhook"))
      }
    })
  }

  function handleTabChange(e, i){
    setTabValue(i)
  }

  function tabsContent(){
    return <Tabs value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit">
              <Tab textColor="inherit" label="Active Webhooks" />
              <Tab textColor="inherit" label="Disabled Webhooks" />
            </Tabs>
  }

  function renderTabcontent(){

    function activeWebhooks(){
      return webhooks.filter((o)=> o.enabled)
    }

    function disabledWebhooks(){
      return webhooks.filter((o)=> !o.enabled)
    }

    switch (tabValue){
      case 0:
        return <React.Fragment>

                <Grid container justify={"space-between"}>
                  <Typography variant={"h4"}>
                    Active Webhooks
                  </Typography>

                  {loading && <Progress/>}

                  <Button 
                    variant={"outlined"} 
                    color={'primary'} 
                    onClick={newWebhook}>
                    New webhook
                  </Button>

                </Grid>

                  <List>
                    {
                      activeWebhooks().map((o) => 
                        <WebhookItem 
                          webhook={o} 
                          key={`webhook-${o.id}`}
                          handleEdit={(o)=> setOpen(o)}
                          handleDelete={(o)=> setOpenDeleteDialog(o)}
                        />
                      )
                    }
                  </List>

                  {
                    activeWebhooks().length === 0 && !loading &&
                    <EmptyCard 
                      goTo={()=>{setTabValue(1)}}
                    />
                  }

             
                </React.Fragment>
      case 1:
        return <React.Fragment>
               
                <Grid container justify={"space-between"}>
                  <Typography variant={"h4"}>
                    Disabled Webhooks
                  </Typography>

                  {loading && <Progress/>}

                  <Button 
                    variant={"outlined"} 
                    color={'primary'} 
                    onClick={newWebhook}>
                    New webhook
                  </Button>

                </Grid>

                <List>
                  {
                    disabledWebhooks().map((o) => 
                      <WebhookItem 
                        webhook={o} 
                        key={`webhook-${o.id}`}
                        handleEdit={(o)=> setOpen(o)}
                        handleDelete={(o)=> setOpenDeleteDialog(o)}
                      />
                    )
                  }
                </List>

                </React.Fragment>
    }
  }

  return <React.Fragment>
            <ContentHeader 
              title={ 'Outgoing webhooks' }
              tabsContent={ tabsContent() }
            />
            <Content>
              {renderTabcontent()}

            </Content>

            {open && (
              <FormDialog 
                open={open}
                titleContent={`${open.id ? 'Update' : 'Add'} webhook`}
                formComponent={
                    <form ref={form}>
                      <Grid container spacing={3}>
                        {
                          definitions().map((field) => {
                            return <Grid item
                                      key={field.name} 
                                      xs={field.grid.xs} 
                                      sm={field.grid.sm}>
                                      <FieldRenderer 
                                        namespace={'app'} 
                                        data={camelizeKeys(field)}
                                        props={{
                                          data: open
                                        }} 
                                        errors={ errors }
                                      />
                                  </Grid>
                          })
                        }
                      </Grid>

                    </form> 
                }
                dialogButtons={
                  <React.Fragment>
                    <Button 
                      onClick={close} 
                      color="secondary">
                      Cancel
                    </Button>

                    <Button onClick={ submit } 
                      color="primary">
                      {open ? 'Update' : 'Create'}
                    </Button>

                  </React.Fragment>
                }
                >
              </FormDialog>
            )}

            {
              openDeleteDialog && <DeleteDialog 
               open={openDeleteDialog}
               title={`Delete webhook ?`} 
               closeHandler={()=>{
                 this.setOpenDeleteDialog(null)
               }}
               deleteHandler={()=> { 
                 removeWebhook(openDeleteDialog)
                }}>
               <Typography variant="subtitle2">
                 The webhook with {openDeleteDialog.dialog} service will 
                 be disabled immediately
               </Typography>
             </DeleteDialog>
            }

        </React.Fragment>
  }


function WebhookItem({webhook, handleEdit, handleDelete}){
  return <ListItem>
            <ListItemText 
              primary={
                  <Typography variant="h5">
                    {webhook.url}
                  </Typography>
                } 
              secondary={<div>
                {
                  webhook.tag_list.map((o)=>(
                    <Chip
                      key={`chip-${o}`}
                      size="small"
                      label={o}
                      style={{margin: '0 0.2em .2em 0px'}}
                    />
                  ))
                }
                
                </div>
            } />

            <ListItemSecondaryAction>

              <Chip
                size="small"
                label={webhook.state}
                color="primary"
              />

              <IconButton 
                onClick={()=> handleEdit(webhook)}
                edge="end" aria-label="add">
                {
                  webhook.id ? 
                  <EditIcon/> : 
                  <AddIcon/>
                }
              </IconButton>

              { 
                webhook.id && <IconButton 
                  onClick={()=> handleDelete(webhook) }
                  edge="end" aria-label="add">
                  <DeleteIcon  />
                </IconButton>
              }
              
            </ListItemSecondaryAction>
          </ListItem>

        {/*webhook.id*/}
}

function EmptyCard({goTo}){
  return (
    <Card style={{marginTop: '2em'}}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
        </Typography>
        <Typography variant="h5" component="h2">
          You don't have any active webhooks yet
        </Typography>
        <Typography color="textSecondary">
          search for your webhooks in <Link href="#" onClick={ goTo }>disabled webhooks</Link> Tab
        </Typography>
      </CardContent>
    </Card>
  )
}


function mapStateToProps(state) {
  const { app } = state

  return {
    app,
  }
}

export default withRouter(connect(mapStateToProps)(Integrations))



