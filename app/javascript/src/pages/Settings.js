import React, {Component} from 'react'
import {
  Switch,
  Route,
  Link
} from "react-router-dom";
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Content from '../components/Content'
import PageHeader from '../components/PageHeader'
import Tabs from '../components/Tabs'
import {HomeIcon} from '../components/icons'
import {
  setCurrentPage, 
  setCurrentSection
} from '../actions/navigation'

import SettingsForm from './settings/form'

import serialize from 'form-serialize'

import FieldRenderer from '../components/forms/FieldRenderer'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import {
  CREATE_DIRECT_UPLOAD,
} from '../graphql/mutations'

import { toSnakeCase } from '../shared/caseConverter'

import ContentHeader from '../components/PageHeader'
import AvailabilitySettings from './settings/Availability'
import EmailRequirement from './settings/EmailRequirement'
import LanguageSettings from './settings/Language'
import InboundSettings from './settings/InboundSettings'
import StylingSettings from './settings/Styling'
import UserData from './settings/UserDataFields'
import timezones from '../shared/timezones'
import {getFileMetadata, directUpload} from '../shared/fileUploader'

import { 
  setApp, 
  updateApp
} from '../actions/app'

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
      updateApp(data.app, (d)=>{
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

              this.update({app: params })
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

  definitionsForSettings = () => {
    return [
      {
        name: "name",
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-3/4' },
        gridProps: {style: {alignSelf: 'flex-end'}}
      },

      {
        name: 'logo',
        type: 'upload',
        grid: { xs: 'w-full' , sm: 'w-1/4' },
        handler: (file)=> this.uploadHandler(file, "logo")
      },

      {
        name: "domainUrl",
        type: 'string',
        label: "Domain URL",
        hint: 'This will be the host site were chaskiq will be used',
        grid: { xs: 'w-1/2' , sm: 'w-1/2' },
      },
      {
        name: "outgoingEmailDomain",
        label: "Outgoing email Domain",
        hint: "The email domain to send conversations, for @yourapp use 'your app'",
        type: 'string',
        grid: { xs: 'w-1/2' , sm: 'w-1/2' },
      },

      {
        name: "tagline",
        type: 'text',
        label: 'talgline',
        hint: "Messenger text on botton",
        grid: { xs: 'w-1/2' , sm: 'w-1/2' },
      },

      { name: "timezone", 
        type: "timezone", 
        label: 'App\'s timezone',
        options: timezones, 
        multiple: false,
        grid: { xs: 'w-1/2' , sm: 'w-1/2' },
      },
      {
        name: "gatherSocialData",
        type: 'bool',
        label: "Collect social data about your users",
        hint: "Collect social profiles via fullcontact service (e.g. LinkedIn, Twitter, etc.) for my users via a third party",
        grid: { xs: 'w-1/2' , sm: 'w-1/2' },
      },
      {
        name: "registerVisits",
        label: "Register & Store visits to database",
        type: 'bool',
        hint: "Even if this is disabled we will collect global counter of visits and store the last visit information on visitor's profile",
        grid: { xs: 'w-1/2' , sm: 'w-1/2' },
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
        placeholder: "Leave it blank for no encryption",
        hint: "This key will be used to encrypt and decrypt JWE user data",
        grid: { xs: 'w-full', sm: 'w-full' }
      },
    ]
  }

  definitionsForAppearance = ()=>{
    return [
      {
        name: "activeMessenger",
        label: "Activate messenger",
        hint: 'When this is activate the messenger web widget will be activated',
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'enableArticlesOnWidget',
        label: "Display article on chat window",
        hint: "This option will display the articles in the home section of the messenger",
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'inlineNewConversations',
        label: "Display new messages in floating box",
        hint: "This option will not open chat box widget",
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
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
        grid: { xs: 'w-full', sm: 'w-1/3' }
      },

      {
        name: "secondary_customization_color",
        type: 'color',
        handler: (color)=> {
          this.props.updateMemSettings({color: color})
        },
        grid: { xs: 'w-full', sm: 'w-1/3' }
      },

      {
        name: "header_image",
        type: 'upload',
        handler: (file)=> this.uploadHandler(file, "header_image"),
        grid: { xs: 'w-full', sm: 'w-1/3' }
      },
    ]
  }


  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              tabs={[
                {label:"App Settings", content: <SettingsForm
                      title={"General app's information"}
                      currentUser={this.props.currentUser}
                      data={this.props.app}
                      update={this.update.bind(this)}
                      fetchApp={this.fetchApp}
                      classes={this.props.classes}
                      definitions={this.definitionsForSettings}
                      {...this.props}
                  />
                },
                {label:"Security", content: <SettingsForm
                      title={"Security Settings"}
                      currentUser={this.props.currentUser}
                      data={this.props.app}
                      update={this.update.bind(this)}
                      fetchApp={this.fetchApp}
                      classes={this.props.classes}
                      definitions={this.definitionsForSecurity}
                      {...this.props}
                    />
                },
                {label:"Appearance", content: <SettingsForm
                            title={"Appearance settings"}
                            currentUser={this.props.currentUser}
                            data={this.props.app}
                            update={this.update.bind(this)}
                            fetchApp={this.fetchApp}
                            classes={this.props.classes}
                            definitions={this.definitionsForAppearance}
                            {...this.props}
                          />

                },
                {label:"Translations", content: <LanguageSettings 
                    settings={ this.props.app } 
                    update={this.update}
                    namespace={'app'}
                    fields={['locale', 'greetings', 'intro', 'tagline',]}
                  />
                },
                {label:"Availability", content: <AvailabilitySettings 
                          settings={ this.props.app } 
                          update={this.update}
                          namespace={'app'}
                          fields={['greetings', 'intro', 'tagline',]}
                        />
                },
                {label:"Email Requirement", content: <EmailRequirement settings={ this.props.app } 
                    update={this.update}
                    namespace={'app'}
                    />
                },
                {label:"Inbound settings", content: <InboundSettings
                    settings={ this.props.app } 
                    update={this.update}
                    namespace={'app'}
                  />
                },
                {label:"Messenger Style", content: <StylingSettings
                    settings={ this.props.app } 
                    update={this.update}
                    namespace={'app'}
                  />
                },
                {label:"User data", content: <UserData 
                settings={ this.props.app } 
                update={this.update}
                namespace={'app'}
              />}
              ]}
            />
  }

  render(){
    return <Content>
        {
          this.props.app &&

          <React.Fragment>

            <ContentHeader 
              title={ 'App Settings' }
            />

            {this.tabsContent()}

          </React.Fragment>
        }
        </Content>
  }
}

function mapStateToProps(state) {
  const { auth , app, segment, app_users, current_user, navigation } = state
  const { loading, isAuthenticated } = auth
  const {current_section} = navigation
  return {
    segment,
    app_users,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section
  }
}

export default withRouter(connect(mapStateToProps)(AppSettingsContainer))