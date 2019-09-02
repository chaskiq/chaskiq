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
import {
  Paper, 
  Button, 
  Typography, 
  Grid
} from '@material-ui/core';
import FieldRenderer from '../shared/FormFields'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import { PREDICATES_SEARCH, UPDATE_APP } from '../graphql/mutations'
import { toSnakeCase } from '../shared/caseConverter'
import { withStyles } from '@material-ui/core/styles';

import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';


import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import AvailabilitySettings from './settings/Availability'
import LanguageSettings from './settings/Language'
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import {
  FormControlLabel,
  Checkbox
} from "@material-ui/core"

const styles = theme => ({
  root: {
    padding: '2em',
    margin: '2em',
  
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

  url = ()=>{
    const id = this.props.match.params.id
    return this.props.isNew ? 
    `/apps.json` : 
    `/apps/${this.props.store.app.key}.json`
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
    return <ContentWrapper>
           

            <Paper 
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

                  <Grid item xs={12} sm={6}>
                    <Button appearance="subtle">
                      Cancel
                    </Button>
                  </Grid>
                </Grid>

              </form>
            </Paper>


          </ContentWrapper>
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
    /*graphql(UPDATE_APP, { 
      appKey: this.props.match.params.appId,
      appParams: data.app
    }, {
      success: (data)=>{
        this.setState({ app: data.appsUpdate.app, errors: data.appsUpdate.errors }, () => {
          //this.props.updateData(response.data)
        })
      }
    })*/
  };

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="App Information" />
              <Tab textColor="inherit" label="Security" />
              <Tab textColor="inherit" label="Appearance" />
              <Tab textColor="inherit" label="Text" />
              <Tab textColor="inherit" label="Availability" />
              <Tab textColor="inherit" label="Email Requirement" />
              <Tab textColor="inherit" label="Inbound settings" />
            </Tabs>
  }

  definitionsForSettings = () => {
    return [
      {
        name: "name",
        type: 'string',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: "domainUrl",
        type: 'string',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: "tagline",
        type: 'text',
        hint: "messenger text on botton",
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForSecurity = () => {
    return [
      {
        name: "encryptionKey",
        type: 'string',
        maxLength: 16, minLength: 16,
        placeholder: "leave it blank for no encryption",
        hint: "this is the hint!",
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForAppearance = ()=>{
    return [
      {
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
      },
      {
        name: "activeMessenger",
        type: 'bool',
        grid: { xs: 12, sm: 12 }
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



export default withStyles(styles, { withTheme: true })(AppSettingsContainer);



