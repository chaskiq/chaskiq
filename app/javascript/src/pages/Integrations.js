import React from 'react'

import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import FormDialog from '../components/FormDialog'
import FieldRenderer from '../shared/FormFields'

const services = [
  {
    name: "Clearbit", 
    type: "enrichment", 
    definitions: [
      {
        name: "api_secret",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  },

  {
    name: "FullContact", 
    type: "enrichment",
    definitions: [
    {
      name: "api_secret",
      type: 'string',
      grid: { xs: 12, sm: 12 }
    },
  ]
  },

  {
    name: "Dialogflow", 
    type: "bot",
    definitions: [
      {
        name: "api_secret",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "project_id",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "api_secret",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  },

  { 
    name: "Helpscout", 
    type: "crm",
    definitions: [
      {
        name: "api_secret",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "api_key",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  },

  { 
    name: "Pipedrive", 
    type: "crm",
    definitions: [
      {
        name: "api_secret",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "api_key",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  },
  {
    name: "Slack", 
    type: "channel",
    definitions: [
      {
        name: "api_secret",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "api_key",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  }
]


export default function Integrations(){

  const [open, setOpen] = React.useState(false)

  function handleOpen(service){
    setOpen(service)
  }

  function close(){
    setOpen(false)
  }

  function submit(){
    console.log("submit here")
  }

  return <React.Fragment>
            <ContentHeader 
              title={ 'Api integrations' }
              //tabsContent={ this.tabsContent() }
            />
            <Content>
            
              <Typography variant={"h4"}>API Integrations</Typography>


              <ul>
                {
                  services.map((o)=> <ServiceBlock 
                                      key={`services-${o.name}`} 
                                      service={o}
                                      handleOpen={handleOpen}
                                      />)
                }
              </ul>
          
            </Content>


            {open && (
              <FormDialog 
                open={open}
                titleContent={`Add ${open.name} integration`}
                formComponent={
                    <form>
                      <Grid container spacing={3}>
                        {
                          open.definitions.map((field) => {
                            return <Grid item
                                      key={field.name} 
                                      xs={field.grid.xs} 
                                      sm={field.grid.sm}>
                                      <FieldRenderer 
                                        namespace={'app'} 
                                        data={field}
                                        props={{
                                          data: {}
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
    <p>
      {service.name}
      <a onClick={()=> handleOpen(service)}>add</a>
    </p>
  )
}


