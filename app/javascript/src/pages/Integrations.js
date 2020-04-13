import React, {
  useState, 
  useEffect, 
  useRef
} from 'react'

import {
  camelizeKeys
} from '../actions/conversation'

import Progress from '../components/Progress'
import Content from '../components/Content'
import FormDialog from '../components/FormDialog'
import DeleteDialog from "../components/DeleteDialog"
import Tabs from '../components/Tabs'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import Button from '../components/Button'
import Badge from '../components/Badge'
import FieldRenderer from '../components/forms/FieldRenderer'

import {
  EditIcon,
  AddIcon,
  DeleteIcon,
  HomeIcon
} from '../components/icons'
import List, {
  ListItem, 
  ListItemText, 
  ItemListPrimaryContent,
  ItemListSecondaryContent,
  ItemAvatar
} from '../components/List'
import {errorMessage, successMessage} from '../actions/status_messages'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";

import graphql from '../graphql/client'
import {
  APP_PACKAGES, 
  APP_PACKAGE_INTEGRATIONS
} from '../graphql/queries'
import {
  CREATE_INTEGRATION,
  UPDATE_INTEGRATION,
  DELETE_INTEGRATION
} from '../graphql/mutations' 
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import serialize from 'form-serialize'


function Integrations({app, dispatch}){

  const [open, setOpen] = useState(false)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [integrations, setIntegrations] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const form = useRef(null);

  useEffect(()=>{
    dispatch(setCurrentSection("Settings"))
    dispatch(setCurrentPage("integrations"))
  }, [])

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
        
        const integration = data.integrationsCreate.integration
        const newIntegrations = integrations.map(
          (o)=> o.name === integration.name ? integration : o
        )
        setIntegrations(newIntegrations)

        setOpen(null)
        dispatch(successMessage("integration created"))
      },
      error: ()=>{
        dispatch(errorMessage("error linking integration"))
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
        const integration = data.integrationsUpdate.integration
        const newIntegrations = integrations.map(
          (o)=> o.name === integration.name ? integration : o
        )
        setIntegrations(newIntegrations)
        //getAppPackageIntegration()
        setOpen(null)
        dispatch(successMessage("integration updated"))
      },
      error: ()=>{
        dispatch(errorMessage("error updating integration"))
      }
    })
  }

  function removeIntegration(){
    graphql(DELETE_INTEGRATION, {
      appKey: app.key,
      id: parseInt(openDeleteDialog.id),
    }, {
      success: (data)=>{
        setTabValue(0)
        const integration = data.integrationsDelete.integration
        const newIntegrations = integrations.filter(
          (o)=> o.name != integration.name
        )
        setIntegrations(newIntegrations)
        setOpen(null)
        setOpenDeleteDialog(null)
        dispatch(successMessage("integration removed correctly"))
      },
      error: ()=>{
        dispatch(errorMessage("error removing integration"))
      }
    })
  }

  function handleTabChange(e, i){
    setTabValue(i)
  }

  return <Content>
            <PageHeader 
              title={'Third party integrations'} 

            />

            <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500 py-4">
              Logos images provided by 
              <a href="https://clearbit.com">
                <b>{' '} Clearbit</b>
              </a>
            </p>

            
          
            <Tabs
              currentTab={tabValue}
              tabs={[
                {
                  label: "Active Webhooks", 
                  icon: <HomeIcon/>,
                  content: <div className="p-6">
                              <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
                                API Integrations
                              </p>
                              {loading && <Progress/>}

                              {
                                integrations.length === 0 && !loading &&
                                <EmptyCard 
                                  goTo={()=>{setTabValue(1)}}
                                />
                              }

                              { 
                                <ServiceIntegration
                                  services={integrations}
                                  handleOpen={handleOpen}
                                  getAppPackages={getAppPackageIntegration}
                                  setOpenDeleteDialog={setOpenDeleteDialog}
                                  kind={"integrations"}
                                />
                              }
                            </div>
                },
                {
                  label: "Disabled Webhooks", 
                  content: <div className="p-6">
                              <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
                                Available API Services
                              </p>
                              {loading && <Progress/>}

                              { <APIServices
                                services={services}
                                handleOpen={handleOpen}
                                getAppPackages={getAppPackages}
                                kind={"services"}
                                /> 
                              }
                            </div>
                }
              ]}
            />


            {open && (
              <FormDialog 
                open={open}
                handleClose={close}
                titleContent={`${open.id ? 'Update' : 'Add'} ${open.name} integration`}
                formComponent={
                    <form ref={form}>
                      <div container spacing={3}>
                        {
                          open.definitions.map((field) => {
                            return <div item
                                      key={field.name} 
                                      xs={field.grid.xs} 
                                      sm={field.grid.sm}>
                                      <FieldRenderer 
                                        namespace={'app'} 
                                        data={camelizeKeys(field)}
                                        type={field.type}
                                        props={{
                                          data: open.settings ? camelizeKeys(open.settings) : {}
                                        }} 
                                        errors={ {} }
                                      />
                                  </div>
                          })
                        }
                      </div>

                      {
                        open.id && <div container direction={"column"}>
                          <p variant="overline" >
                            This integration will receive webhook at:
                          </p>

                          <p variant={"caption"}>
                            {`${window.location.origin}/api/v1/hooks/${app.key}/${open.name.toLocaleLowerCase()}/${open.id}`}
                          </p>

                          <p variant="overline" >
                            Oauth callback:
                          </p>

                          <p variant={"caption"}>
                            {`${window.location.origin}/api/v1/oauth/${app.key}/${open.name.toLocaleLowerCase()}/${open.id}`}
                          </p>
                        </div>
                      }
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
               title={`Delete "${openDeleteDialog.name}" integration ?`} 
               closeHandler={()=>{
                 setOpenDeleteDialog(null)
               }}
               deleteHandler={()=> { 
                 removeIntegration(openDeleteDialog)
                }}>
               <p variant="subtitle2">
                 The integration with {openDeleteDialog.dialog} service will 
                 be disabled immediately
               </p>
             </DeleteDialog>
            }

        </Content>
  }




  function EmptyCard({goTo}){
  return (
    <div style={{marginTop: '2em'}}>
      <div>
        <p color="textSecondary" gutterBottom>
        </p>
        <p variant="h5" component="h2">
          You don't have any api integrations yet
        </p>
        <p color="textSecondary">
          search for available api services in 
          <a href="#" onClick={ goTo }>API Services</a> Tab
        </p>
      </div>
    </div>
  )
}

function ServiceBlock({
  service, 
  handleOpen,
  kind,
  setOpenDeleteDialog
}){

  function available(){
    if(kind === "services") return service.state === "enabled"
    if(kind === "integrations") return service.id && service.state === "enabled"
  }

  return (

      <ListItem avatar={
        <ItemAvatar avatar={service.icon}/>
      }>
      <ListItemText 
        primary={
          <ItemListPrimaryContent variant="h5">
            {service.name} {' '}
            <Badge>
              {service.state}
            </Badge>
          </ItemListPrimaryContent>
        } 
        secondary={
          <ItemListSecondaryContent>
            {service.description}
          </ItemListSecondaryContent>
        } 

        terciary={
          <React.Fragment>

            <div className="mt-2 flex items-center 
            text-sm leading-5 text-gray-500 justify-end">
                
              {
                available() && 
                  <React.Fragment>
                  <Button 
                    onClick={()=> handleOpen(service)}
                    edge="end" aria-label="add">
                    {
                      service.id ? 
                      <EditIcon/> : 
                      <AddIcon/>
                    }
                  </Button>
      
                  { 
                    service.id && <Button 
                      onClick={()=> setOpenDeleteDialog && setOpenDeleteDialog(service)}
                      edge="end" aria-label="add">
                      <DeleteIcon  />
                    </Button>
                  }
                  </React.Fragment>
              }

            </div>
          </React.Fragment>
        }
      
      />

    </ListItem>


  )
}

function ServiceIntegration({
  services, 
  handleOpen, 
  getAppPackages,
  kind,
  setOpenDeleteDialog
}){

  useEffect(()=>{
    getAppPackages()
  }, [])

  return (

    <List>
      {
        services.map((o)=> <ServiceBlock
                            kind={kind}
                            key={`services-${o.name}`} 
                            service={o}
                            setOpenDeleteDialog={setOpenDeleteDialog}
                            handleOpen={handleOpen}
                            />)
      }
    </List>

  )
}

function APIServices({
  services, 
  handleOpen, 
  getAppPackages,
  kind
}){

  useEffect(()=>{
    getAppPackages()
  }, [])

  return (

    <List dense>
      {
        services.map((o)=> <ServiceBlock
                            kind={kind} 
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



