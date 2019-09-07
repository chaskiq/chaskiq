import React, {Component, useState} from 'react'
import FieldRenderer from '../../shared/FormFields'
import {
  Grid,
  Button,
  Tabs,
  Tab,
  Typography
} from '@material-ui/core'

import {toSnakeCase} from '../../shared/caseConverter'
import serialize from 'form-serialize'

import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'

const SettingsForm = ({app, data, errors, updateData}) => {

  const [tabValue, setTabValue] = useState(0)

  let formRef 

  function tabsContent(){
    return <Tabs value={tabValue} 
              onChange={handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="For Leads" />
              <Tab textColor="inherit" label="For Users" />
            </Tabs>
  }

  function handleTabChange(e, i){
    setTabValue(i)
  }

  const renderTabcontent = ()=>{
    switch (tabValue){
      case 0:
        return <LeadsSettings/>
      case 1:
        return <UsersSettings/>
    }
  }  

  return (

    <div>
      <ContentHeader 
        title={ "dsdsfdfs" }
        items={ [<Grid item>
                  <Button variant={"outlined"} > save data </Button>
                </Grid> , 
                <Grid item>
                  <Button color={"default"} variant={"contained"}>
                    set live
                  </Button>
                </Grid>
              ]
            }
        tabsContent={tabsContent()}
      />

      <Content>
        {renderTabcontent()}
      </Content>
    </div>
  )
}


function UsersSettings(){
  return (
    <div>
      <Typography variant={"h5"}>
        When users start a conversation
      </Typography>
        
      <Typography variant={"h6"}>
        Leave a 2 minute delay before triggering Task Bots during office hours
      </Typography>

    </div>
  )
}


function LeadsSettings(){
  return (
    <div>
      <Typography variant={"h5"}>
        When leads start a conversation
      </Typography>
        
      <Typography variant={"h6"}>
        Leave a 2 minute delay before triggering Task Bots during office hours
      </Typography>


      <Typography variant={"h6"}>
        Share your typical reply time 
      </Typography>
      

      <Typography variant={"h6"}>
        Route existing customers to support
      </Typography>

      Route leads to the right people by asking if they are an existing customer when they start a new conversation.

      What do you want to do when they choose "Yes, I'm a customer"?

      Assign the conversation
      Close the conversation


      Ask for contact details

      If we don’t already have their contact details, Operator will suggest that customers leave their email address or their phone number to get notified whenever you reply.
      
      Ask for email only
      Ask for email or mobile number 

    </div>
  )
}

export default SettingsForm