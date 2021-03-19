import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import Content from '../components/Content'

import Tabs from '../components/Tabs'

import { setCurrentPage, setCurrentSection } from '../actions/navigation'
import SettingsForm from './settings/form'

import graphql from '../graphql/client'
import { APP } from '../graphql/queries'
import { CREATE_DIRECT_UPLOAD } from '../graphql/mutations'

import ContentHeader from '../components/PageHeader'
import AvailabilitySettings from './settings/Availability'
import EmailRequirement from './settings/EmailRequirement'
import LanguageSettings from './settings/Language'
import InboundSettings from './settings/InboundSettings'
import StylingSettings from './settings/Styling'
import AppInserter from './settings/AppInserter'
import { getFileMetadata, directUpload } from '../shared/fileUploader'

import { updateApp } from '../actions/app'

class AppSettingsContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabValue: 0
    }
  }

  componentDidMount () {
    this.props.dispatch(setCurrentPage('messenger'))
    this.props.dispatch(setCurrentSection('Settings'))
  }

  url = () => {
    return `/apps/${this.props.match.params.appId}.json`
  };

  fetchApp = () => {
    graphql(
      APP,
      { appKey: this.props.match.params.appId },
      {
        success: (data) => {
          this.setState({ app: data.app })
        },
        errors: (error) => {
          console.log(error)
        }
      }
    )
  };

  // Form Event Handlers
  update = (data) => {
    this.props.dispatch(
      updateApp(data.app, (d) => {
        console.log(d)
      })
    )
  };

  uploadHandler = (file, kind) => {
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            //serviceUrl
          } = data.createDirectUpload.directUpload

          directUpload(url, JSON.parse(headers), file).then(() => {
            const params = {}
            params[kind] = signedBlobId

            this.update({ app: params })
          })
        },
        error: (error) => {
          console.log('error on signing blob', error)
        }
      })
    })
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i })
  };

  definitionsForPrivacy = () => {
    return [

      {
        name: 'privacyConsentRequired',
        label: I18n.t('definitions.settings.privacy_consent_required_ue.label'),
        hint: I18n.t('definitions.settings.privacy_consent_required_ue.hint'),
        value: 'ue',
        type: 'radio',
        defaultChecked: this.props.app.privacyConsentRequired === 'ue',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'privacyConsentRequired',
        label: I18n.t('definitions.settings.privacy_consent_required_all.label'),
        hint: I18n.t('definitions.settings.privacy_consent_required_all.hint'),
        type: 'radio',
        value: 'all',
        defaultChecked: this.props.app.privacyConsentRequired === 'all',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'privacyConsentRequired',
        label: I18n.t('definitions.settings.privacy_consent_required_none.label'),
        hint: I18n.t('definitions.settings.privacy_consent_required_none.hint'),
        type: 'radio',
        value: 'none',
        defaultChecked: this.props.app.privacyConsentRequired === '',
        grid: { xs: 'w-full', sm: 'w-full' }
      }
    ]
  }

  definitionsForAppearance = () => {
    return [
      {
        name: 'activeMessenger',
        label: I18n.t('definitions.settings.active_messenger.label'),
        hint: I18n.t('definitions.settings.active_messenger.hint'),
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'inlineNewConversations',
        label: I18n.t('definitions.settings.inline_conversation.label'),
        hint: I18n.t('definitions.settings.inline_conversation.hint'),
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
      }
    ]
  };

  definitionsForStyling = () => {
    return [
      {
        name: 'primary_customization_color',
        type: 'color',
        handler: (color) => {
          this.props.updateMemSettings({ color: color })
        },
        grid: { xs: 'w-full', sm: 'w-1/3' }
      },

      {
        name: 'secondary_customization_color',
        type: 'color',
        handler: (color) => {
          this.props.updateMemSettings({ color: color })
        },
        grid: { xs: 'w-full', sm: 'w-1/3' }
      },

      {
        name: 'header_image',
        type: 'upload',
        label: 'Header Image',
        handler: (file) => this.uploadHandler(file, 'header_image'),
        grid: { xs: 'w-full', sm: 'w-1/3' }
      }
    ]
  };

  tabsContent = () => {
    return (
      <Tabs
        value={this.state.tabValue}
        onChange={this.handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="inherit"
        tabs={[
          {
            label: I18n.t('settings.app.appearance'),
            content: (
              <SettingsForm
                title={I18n.t('settings.app.appearance_title')}
                currentUser={this.props.currentUser}
                data={this.props.app}
                update={this.update.bind(this)}
                fetchApp={this.fetchApp}
                classes={this.props.classes}
                definitions={this.definitionsForAppearance}
                {...this.props}
              />
            )
          },
          {
            label: I18n.t('settings.app.translations'),
            content: (
              <LanguageSettings
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
                fields={['locale', 'greetings', 'intro', 'tagline']}
              />
            )
          },

          {
            label: I18n.t('settings.app.privacy'),
            content: (
              <SettingsForm
                title={I18n.t('settings.app.privacy_title')}
                currentUser={this.props.currentUser}
                data={this.props.app}
                update={this.update.bind(this)}
                fetchApp={this.fetchApp}
                classes={this.props.classes}
                definitions={this.definitionsForPrivacy}
                {...this.props}
              />
            )
          },
          {
            label: 'Apps',
            content: (
              <AppInserter
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            )
          },
          {
            label: I18n.t('settings.app.availability'),
            content: (
              <AvailabilitySettings
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
                fields={['greetings', 'intro', 'tagline']}
              />
            )
          },
          {
            label: I18n.t('settings.app.email_requirement'),
            content: (
              <EmailRequirement
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            )
          },
          {
            label: I18n.t('settings.app.inbound_settings'),
            content: (
              <InboundSettings
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            )
          },
          {
            label: I18n.t('settings.app.messenger_style'),
            content: (
              <StylingSettings
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            )
          }
        ]}
      />
    )
  };

  render () {
    return (
      <Content>
        {this.props.app && (
          <React.Fragment>
            <ContentHeader title={I18n.t('settings.app.messenger_settings')} />

            {this.tabsContent()}
          </React.Fragment>
        )}
      </Content>
    )
  }
}

function mapStateToProps (state) {
  const { auth, app, segment, app_users, current_user, navigation } = state
  const { loading, isAuthenticated } = auth
  const { current_section } = navigation
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
