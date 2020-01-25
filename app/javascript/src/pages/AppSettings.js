import React, {Component} from "react"
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import styled from '@emotion/styled'
import axios from 'axios'
import serialize from 'form-serialize'

import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import FieldRenderer from '../shared/FormFields'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import { PREDICATES_SEARCH, UPDATE_APP } from '../graphql/mutations'
import { toSnakeCase } from '../shared/caseConverter'
import { withStyles } from '@material-ui/core/styles';

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import AvailabilitySettings from './settings/Availability'
import EmailRequirement from './settings/EmailRequirement'
import LanguageSettings from './settings/Language'
import InboundSettings from './settings/InboundSettings'
import StylingSettings from './settings/Styling'
import UserData from './settings/UserDataFields'
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import timezones from '../shared/timezones'
import {getFileMetadata, directUpload} from '../shared/fileUploader'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";

const styles = theme => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },

  },
  formControl: {
    margin: theme.spacing.unit,
    //minWidth: 120,
    //maxWidth: 300,
    width: '100%'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
});

class SettingsForm extends Component {

  constructor(props){
    super(props)
    this.state = {
      selected: 0,
      data: {},
      errors: {}
    }    
  }

  tabs = ()=>{
    var b = []
    return b    
  }

  onSubmitHandler = (e) => {
    e.preventDefault()
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data           = toSnakeCase(serializedData)
    this.props.update(data)
  }

  render(){
    return <Paper 
              elevation={0}
              className={this.props.classes.root}>
              <form
                name="create-repo"
                onSubmit={this.onSubmitHandler.bind(this)}
                ref={form => {
                  this.formRef = form;
                }}>

                <Typography variant="h6" gutterBottom>
                  {this.props.title}
                </Typography>

                <Grid container spacing={3}>
                  {
                    this.props.definitions().map((field) => {
                      return <Grid item
                                key={field.name} 
                                xs={field.grid.xs} 
                                sm={field.grid.sm}>
                                <FieldRenderer 
                                  namespace={'app'} 
                                  data={field}
                                  props={this.props} 
                                  errors={this.props.data.errors || {} }
                                 />
                             </Grid>
                    })
                  }

                </Grid>

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" color="primary" type="submit">
                      Save settings
                    </Button>
                  </Grid>
                </Grid>

              </form>
            </Paper>
  }

}



class AppSettingsContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      tabValue: 0
    }
  }

  componentDidMount(){
    //this.fetchApp()
    this.props.dispatch(setCurrentPage("app_settings"))
    this.props.dispatch(setCurrentSection("Settings"))
  }

  url = ()=>{
    return `/apps/${this.props.match.params.appId}.json`
  }

  fetchApp = ()=>{
    graphql(APP, { appKey: this.props.match.params.appId}, {
      success: (data)=>{
        this.setState({ app: data.app })
      },
      errors: (error)=>{
        console.log(error)
      }
    })
  }

  // Form Event Handlers
  update = (data) => {
    this.props.dispatch(
      this.props.updateApp(data.app, (d)=>{
        console.log(d)
      })
    )
  };

  uploadHandler = (file, kind)=>{

    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
       
          directUpload(url, JSON.parse(headers), file).then(
            () => {
              let params = {}
              params[kind] = signedBlobId
              this.props.update({settings: params})
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    });
  }

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit">
              <Tab textColor="inherit" label="App Settings" />
              <Tab textColor="inherit" label="Security" />
              <Tab textColor="inherit" label="Appearance" />
              <Tab textColor="inherit" label="Translations" />
              <Tab textColor="inherit" label="Availability" />
              <Tab textColor="inherit" label="Email Requirement" />
              <Tab textColor="inherit" label="Inbound settings" />
              <Tab textColor={"inherit"} label="Messenger Style" />
              <Tab textColor={"inherit"} label="User data" />
            </Tabs>
  }

  definitionsForSettings = () => {
    return [
      {
        name: "name",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "domainUrl",
        type: 'string',
        label: "Domain URL",
        hint: 'this will be the host site were chaskiq will be used',
        grid: { xs: 6, sm: 6 }
      },
      {
        name: "outgoingEmailDomain",
        label: "Outgoing email Domain",
        hint: "the email domain to send conversations, for @yourapp use 'your app'",
        type: 'string',
        grid: { xs: 6, sm: 6 }
      },

      {
        name: "tagline",
        type: 'text',
        hint: "messenger text on botton",
        grid: { xs: 12, sm: 12 }
      },

      { name: "timezone", 
        type: "timezone", 
        options: timezones, 
        multiple: false,
        grid: {xs: 12, sm: 12 }
      },
      {
        name: "gatherSocialData",
        label: "Gather social data",
        type: 'bool',
        label: "Collect social data about your users",
        hint: "Collect social profiles via fullcontact service (e.g. LinkedIn, Twitter, etc.) for my users via a third party",
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "registerVisits",
        label: "Register visits to database",
        type: 'bool',
        label: "Store visits for visitors",
        hint: "Even if this is disabled we will collect global counter of visits and store the last visit information on visitor's profile",
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForSecurity = () => {
    return [
      {
        name: "encryptionKey",
        label: "Encryption Key", 
        type: 'string',
        maxLength: 16, minLength: 16,
        placeholder: "leave it blank for no encryption",
        hint: "this key will be used to encrypt and decrypt JWE user data",
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForAppearance = ()=>{
    return [
      /*{
        name: "state",
        type: "select",
        grid: { xs: 12, sm: 6 },
        options: ["enabled", "disabled"]
      },
      {
        name: "theme",
        type: "select",
        options: ["dark", "light"],
        grid: { xs: 12, sm: 6 }
      },*/
      {
        name: "activeMessenger",
        type: 'bool',
        grid: { xs: 12, sm: 12 }
      },

    ]
  }

  definitionsForStyling = ()=>{
    return [
      {
        name: "primary_customization_color",
        type: 'color',
        handler: (color)=> {
          this.props.updateMemSettings({color: color})
        },
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "secondary_customization_color",
        type: 'color',
        handler: (color)=> {
          this.props.updateMemSettings({color: color})
        },
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "header_image",
        type: 'upload',
        handler: (file)=> this.uploadHandler(file, "header_image"),
        grid: { xs: 12, sm: 4 }
      },
    ]
  }



  renderTabcontent = ()=>{

    switch (this.state.tabValue){
      case 0:
        return <SettingsForm
                  title={"General app's information"}
                  currentUser={this.props.currentUser}
                  data={this.props.app}
                  update={this.update.bind(this)}
                  fetchApp={this.fetchApp}
                  classes={this.props.classes}
                  definitions={this.definitionsForSettings}
                  {...this.props}
               />

      case 1:
        return <SettingsForm
                  title={"Security Settings"}
                  currentUser={this.props.currentUser}
                  data={this.props.app}
                  update={this.update.bind(this)}
                  fetchApp={this.fetchApp}
                  classes={this.props.classes}
                  definitions={this.definitionsForSecurity}
                  {...this.props}
                />
      case 2:
        return <SettingsForm
                  title={"Appearance settings"}
                  currentUser={this.props.currentUser}
                  data={this.props.app}
                  update={this.update.bind(this)}
                  fetchApp={this.fetchApp}
                  classes={this.props.classes}
                  definitions={this.definitionsForAppearance}
                  {...this.props}
                />

      case 3:
          return <LanguageSettings 
                  settings={ this.props.app } 
                  update={this.update}
                  namespace={'app'}
                  fields={['greetings', 'intro', 'tagline',]}
                />
      case 4:
        return <AvailabilitySettings 
                settings={ this.props.app } 
                update={this.update}
                namespace={'app'}
                fields={['greetings', 'intro', 'tagline',]}
              />
      case 5: 
        return <EmailRequirement settings={ this.props.app } 
                                update={this.update}
                                namespace={'app'}
                                />
      case 6:
        return <InboundSettings
                  settings={ this.props.app } 
                  update={this.update}
                  namespace={'app'}
                />

      case 7:
        return <StylingSettings
                  settings={ this.props.app } 
                  update={this.update}
                  namespace={'app'}
                />
      case 8:
        return <UserData 
          settings={ this.props.app } 
          update={this.update}
          namespace={'app'}
        />
    }
  }

  render(){
    return <div>
        {
          this.props.app ?

          <React.Fragment>

            <ContentHeader 
              title={ 'App Settings' }
              tabsContent={ this.tabsContent() }
            />


            <Content>
              {this.renderTabcontent()}
            </Content>
            

          </React.Fragment> : null
        }
        </div>
  }
}


export {SettingsForm}
export default withStyles(styles, { withTheme: true })(AppSettingsContainer);



