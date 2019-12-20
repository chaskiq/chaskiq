import React, {
  useState, 
  useEffect, 
  useRef
} from 'react'

import {
  camelizeKeys
} from '../actions/conversation'

import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import AddIcon from '@material-ui/icons/Add';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import LoadingView from '../components/loadingView'


import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import FormDialog from '../components/FormDialog'
import FieldRenderer from '../shared/FormFields'
import graphql from '../graphql/client'
import {
  APP_PACKAGES, 
  APP_PACKAGE_INTEGRATIONS
} from '../graphql/queries'
import {
  CREATE_INTEGRATION,
  UPDATE_INTEGRATION
} from '../graphql/mutations' 
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import serialize from 'form-serialize'


function Integrations({app}){

  const [open, setOpen] = useState(false)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [integrations, setIntegrations] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const form = useRef(null);

  /*useEffect(()=>{
    getAppPackages()
  }, [])*/

  function getAppPackages(){
    setLoading(true)
    graphql(APP_PACKAGES, {
      appKey: app.key 
    }, {
      success: (data)=>{
        setServices(data.app.appPackages)
        setLoading(false)
      }, 
      error: ()=>{
        setLoading(false)
      }
    })
  }

  function getAppPackageIntegration(){
    setLoading(true)
    graphql(APP_PACKAGE_INTEGRATIONS,{
      appKey: app.key
    }, {
      success: (data)=>{
        setIntegrations(data.app.appPackageIntegrations)
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
    updateIntegration(serializedData) :
    createIntegration(serializedData)
  }


  function createIntegration(serializedData){
    graphql(CREATE_INTEGRATION, {
      appKey: app.key,
      appPackage: open.name,
      params: serializedData.app
    }, {
      success: (data)=>{
        setTabValue(0)
        getAppPackages()
        setOpen(null)
      },
      error: ()=>{
      }
    })
  }

  function updateIntegration(serializedData){
    graphql(UPDATE_INTEGRATION, {
      appKey: app.key,
      appPackage: open.name,
      id: parseInt(open.id),
      params: serializedData.app
    }, {
      success: (data)=>{
        setTabValue(0)
        getAppPackages()
        setOpen(null)
      },
      error: ()=>{
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
              <Tab textColor="inherit" label="Integrations" />
              <Tab textColor="inherit" label="more" />
            </Tabs>
  }

  function renderTabcontent(){

    switch (tabValue){
      case 0:
        return <React.Fragment>
                  <Typography variant={"h4"}>
                    API Integrations
                  </Typography>
                  {loading && <LoadingView/>}

                  { <ServiceIntegration
                    services={integrations}
                    handleOpen={handleOpen}
                    getAppPackages={getAppPackageIntegration}
                  />}
                </React.Fragment>
      case 1:
        return <React.Fragment>
                  <Typography variant={"h4"}>
                    Available API Services
                  </Typography>
                  {loading && <LoadingView/>}

                  { <APIServices
                    services={services}
                    handleOpen={handleOpen}
                    getAppPackages={getAppPackages}
                  /> }
                </React.Fragment>
    }
  }

  return <React.Fragment>
            <ContentHeader 
              title={ 'Api integrations' }
              tabsContent={ tabsContent() }
            />
            <Content>
              {renderTabcontent()}
            </Content>

            {open && (
              <FormDialog 
                open={open}
                titleContent={`${open.id ? 'Update' : 'Add'} ${open.name} integration`}
                formComponent={
                    <form ref={form}>
                      <Grid container spacing={3}>
                        {
                          open.definitions.map((field) => {
                            return <Grid item
                                      key={field.name} 
                                      xs={field.grid.xs} 
                                      sm={field.grid.sm}>
                                      <FieldRenderer 
                                        namespace={'app'} 
                                        data={camelizeKeys(field)}
                                        props={{
                                          data: open.settings ? camelizeKeys(open.settings) : {}
                                        }} 
                                        errors={ {} }
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

        </React.Fragment>
  }

function ServiceBlock({service, handleOpen}){
  return (
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <img 
              src={service.icon}
              height={20}
              width={20}
            />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={service.name}
          secondary={service.description}
        />
        <ListItemSecondaryAction>
          <IconButton 
            onClick={()=> handleOpen(service)}
            edge="end" aria-label="add">
            <AddIcon  />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
  )
}

function ServiceIntegration({
  services, 
  handleOpen, 
  getAppPackages
}){

  useEffect(()=>{
    getAppPackages()
  }, [])

  return (

    <List dense>
      {
        services.map((o)=> <ServiceBlock 
                            key={`services-${o.name}`} 
                            service={o}
                            handleOpen={handleOpen}
                            />)
      }
    </List>

  )
}

function APIServices({services, handleOpen, getAppPackages}){

  useEffect(()=>{
    getAppPackages()
  }, [])

  return (

    <List dense>
      {
        services.map((o)=> <ServiceBlock 
                            key={`services-${o.name}`} 
                            service={o}
                            handleOpen={handleOpen}
                            />)
      }
    </List>


  )
}


function mapStateToProps(state) {
  const { app } = state

  return {
    app,
  }
}

export default withRouter(connect(mapStateToProps)(Integrations))



