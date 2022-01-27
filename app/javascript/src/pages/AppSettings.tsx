import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import SettingsForm from './settings/form';
import Tags from './settings/Tags';
import QuickReplies from './settings/QuickReplies';
import UserData from './settings/UserDataFields';
import VerificationView from './settings/VerificationView';
import ContactAvatars from './settings/ContactAvatars';
import timezones from '../shared/timezones';
import I18n from '../shared/FakeI18n';

import graphql from '@chaskiq/store/src/graphql/client';

import Content from '@chaskiq/components/src/components/Content';
import Tabs from '@chaskiq/components/src/components/Tabs';
import ContentHeader from '@chaskiq/components/src/components/PageHeader';
import {
  getFileMetadata,
  directUpload,
} from '@chaskiq/components/src/components/fileUploader';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

import { updateApp } from '@chaskiq/store/src/actions/app';

import { APP } from '@chaskiq/store/src/graphql/queries';
import { CREATE_DIRECT_UPLOAD } from '@chaskiq/store/src/graphql/mutations';

type AppSettingsContainerProps = {
  dispatch: (value: any) => void;
  match: any;
  currentUser: any;
  classes: string;
  app: any;
};

type AppSettingsContainerState = {
  tabValue: number;
  app: any;
};

class AppSettingsContainer extends Component<
  AppSettingsContainerProps,
  AppSettingsContainerState
> {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      app: null,
    };
  }

  componentDidMount() {
    // this.fetchApp()
    this.props.dispatch(setCurrentPage('app_settings'));
    this.props.dispatch(setCurrentSection('Settings'));
  }

  url = () => {
    return `/apps/${this.props.match.params.appId}.json`;
  };

  fetchApp = () => {
    graphql(
      APP,
      { appKey: this.props.match.params.appId },
      {
        success: (data) => {
          this.setState({ app: data.app });
        },
        errors: (error) => {
          console.log(error);
        },
      }
    );
  };

  // Form Event Handlers
  update = (data) => {
    this.props.dispatch(
      updateApp(data.app, (d) => {
        console.log(d);
      })
    );
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
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            const params = {};
            params[kind] = signedBlobId;

            this.update({ app: params });
          });
        },
        error: (error) => {
          console.log('error on signing blob', error);
        },
      });
    });
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  definitionsForSettings = () => {
    return [
      {
        name: 'name',
        label: I18n.t('definitions.settings.name.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-3/4' },
        gridProps: { style: { alignSelf: 'flex-end' } },
      },

      {
        name: 'logo',
        label: I18n.t('definitions.settings.logo.label'),
        type: 'upload',
        grid: { xs: 'w-full', sm: 'w-1/4' },
        handler: (file) => this.uploadHandler(file, 'logo'),
      },

      {
        name: 'domainUrl',
        type: 'string',
        label: I18n.t('definitions.settings.domain.label'),
        hint: I18n.t('definitions.settings.domain.hint'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'outgoingEmailDomain',
        label: I18n.t('definitions.settings.outgoing_email_domain.label'),
        hint: I18n.t('definitions.settings.outgoing_email_domain.hint'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },

      {
        name: 'tagline',
        label: I18n.t('definitions.settings.tagline.label'),
        type: 'text',
        hint: I18n.t('definitions.settings.tagline.hint'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },

      {
        name: 'timezone',
        type: 'timezone',
        label: I18n.t('definitions.settings.timezone.label'),
        options: timezones,
        multiple: false,
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'gatherSocialData',
        type: 'bool',
        label: I18n.t('definitions.settings.gather_social_data.label'),
        hint: I18n.t('definitions.settings.gather_social_data.hint'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'registerVisits',
        label: I18n.t('definitions.settings.register_visits.label'),
        type: 'bool',
        hint: I18n.t('definitions.settings.register_visits.hint'),
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
    ];
  };

  definitionsForSecurity = () => {
    return [
      {
        name: 'encryptionKey',
        label: I18n.t('definitions.settings.encryption_key.label'),
        type: 'string',
        maxLength: 16,
        minLength: 16,
        placeholder: I18n.t('definitions.settings.encryption_key.placeholder'),
        hint: I18n.t('definitions.settings.encryption_key.hint'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
    ];
  };

  tabsContent = () => {
    return (
      <Tabs
        currentTab={this.state.tabValue}
        onChange={this.handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="inherit"
        tabs={[
          {
            label: I18n.t('settings.app.app_settings'),
            content: (
              <SettingsForm
                title={I18n.t('settings.app.app_settings')}
                currentUser={this.props.currentUser}
                data={this.props.app}
                update={this.update.bind(this)}
                classes={this.props.classes}
                definitions={this.definitionsForSettings}
                {...this.props}
              />
            ),
          },
          {
            label: I18n.t('settings.app.security'),
            content: (
              <div>
                <VerificationView />
              </div>
            ),
          },
          {
            label: I18n.t('settings.app.user_data'),
            content: (
              <UserData
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            ),
          },
          {
            label: I18n.t('settings.app.tags'),
            content: (
              <Tags
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            ),
          },
          {
            label: I18n.t('settings.app.quick_replies'),
            content: (
              <QuickReplies
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            ),
          },

          {
            label: I18n.t('settings.app.contact_avatars'),
            content: (
              <ContactAvatars
                settings={this.props.app}
                update={this.update}
                namespace={'app'}
              />
            ),
          },

          {
            label: I18n.t('settings.app.email_forwarding'),
            content: (
              <div className="py-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  {I18n.t('email_forwarding.subtitle')}
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>{I18n.t('email_forwarding.ex')}</p>
                </div>
                <div className="mt-3 text-sm bg-gray-200 p-4 rounded-md">
                  <p className="font-medium text-indigo-600 hover:text-indigo-500">
                    {this.props.app.inboundEmailAddress}
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />
    );
  };

  render() {
    return (
      <Content>
        {this.props.app && (
          <React.Fragment>
            <ContentHeader title={I18n.t('settings.app.app_settings')} />

            {this.tabsContent()}
          </React.Fragment>
        )}
      </Content>
    );
  }
}

function mapStateToProps(state) {
  const { auth, app, segment, app_users, current_user, navigation } = state;
  const { loading, isAuthenticated } = auth;
  const { current_section } = navigation;
  return {
    segment,
    app_users,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section,
  };
}

export default withRouter(connect(mapStateToProps)(AppSettingsContainer));
