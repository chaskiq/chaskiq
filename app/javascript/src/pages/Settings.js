import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Content from "../components/Content";
import PageHeader from "../components/PageHeader";
import Tabs from "../components/Tabs";
import { HomeIcon } from "../components/icons";
import { setCurrentPage, setCurrentSection } from "../actions/navigation";
import SettingsForm from "./settings/form";

import serialize from "form-serialize";

import FieldRenderer from "../components/forms/FieldRenderer";
import graphql from "../graphql/client";
import { APP } from "../graphql/queries";
import { CREATE_DIRECT_UPLOAD } from "../graphql/mutations";

import { toSnakeCase } from "../shared/caseConverter";

import ContentHeader from "../components/PageHeader";
import AvailabilitySettings from "./settings/Availability";
import EmailRequirement from "./settings/EmailRequirement";
import LanguageSettings from "./settings/Language";
import InboundSettings from "./settings/InboundSettings";
import StylingSettings from "./settings/Styling";
import UserData from "./settings/UserDataFields";
import timezones from "../shared/timezones";
import { getFileMetadata, directUpload } from "../shared/fileUploader";

import { setApp, updateApp } from "../actions/app";

class AppSettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
    };
  }

  componentDidMount() {
    //this.fetchApp()
    this.props.dispatch(setCurrentPage("app_settings"));
    this.props.dispatch(setCurrentSection("Settings"));
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
            serviceUrl,
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            let params = {};
            params[kind] = signedBlobId;

            this.update({ app: params });
          });
        },
        error: (error) => {
          console.log("error on signing blob", error);
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
        name: "name",
        label: I18n.t('definitions.settings.name.label'),
        type: "string",
        grid: { xs: "w-full", sm: "w-3/4" },
        gridProps: { style: { alignSelf: "flex-end" } },
      },

      {
        name: "logo",
        label: I18n.t('definitions.settings.logo.label'),
        type: "upload",
        grid: { xs: "w-full", sm: "w-1/4" },
        handler: (file) => this.uploadHandler(file, "logo"),
      },

      {
        name: "domainUrl",
        type: "string",
        label: I18n.t('definitions.settings.domain.label'),
        hint: I18n.t('definitions.settings.domain.hint'),
        grid: { xs: "w-full", sm: "w-1/2" },
      },
      {
        name: "outgoingEmailDomain",
        label: I18n.t('definitions.settings.outgoing_email_domain.label'),
        hint: I18n.t('definitions.settings.outgoing_email_domain.hint'),
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" },
      },

      {
        name: "tagline",
        label: I18n.t('definitions.settings.tagline.label'),
        type: "text",
        label: "talgline",
        hint: I18n.t('definitions.settings.tagline.hint'),
        grid: { xs: "w-full", sm: "w-1/2" },
      },

      {
        name: "timezone",
        type: "timezone",
        label: I18n.t('definitions.settings.timezone.label'),
        options: timezones,
        multiple: false,
        grid: { xs: "w-full", sm: "w-1/2" },
      },
      {
        name: "gatherSocialData",
        type: "bool",
        label: I18n.t('definitions.settings.gather_social_data.label'),
        hint: I18n.t('definitions.settings.gather_social_data.hint'),
        grid: { xs: "w-full", sm: "w-1/2" },
      },
      {
        name: "registerVisits",
        label: I18n.t('definitions.settings.register_visits.label'),
        type: "bool",
        hint: I18n.t('definitions.settings.register_visits.hint'),
        grid: { xs: "w-full", sm: "w-1/2" },
      },
    ];
  };

  definitionsForSecurity = () => {
    return [
      {
        name: "encryptionKey",
        label: I18n.t('definitions.settings.encryption_key.label'),
        type: "string",
        maxLength: 16,
        minLength: 16,
        placeholder: I18n.t('definitions.settings.encryption_key.placeholder'),
        hint: I18n.t('definitions.settings.encryption_key.hint'),
        grid: { xs: "w-full", sm: "w-full" },
      },
    ];
  };

  definitionsForAppearance = () => {
    return [
      {
        name: "activeMessenger",
        label: I18n.t('definitions.settings.active_messenger.label'),
        hint: I18n.t('definitions.settings.active_messenger.hint'),
        type: "bool",
        grid: { xs: "w-full", sm: "w-full" },
      },

      {
        name: "enableArticlesOnWidget",
        label: I18n.t('definitions.settings.enable_articles.label'),
        hint: I18n.t('definitions.settings.enable_articles.hint'),
        type: "bool",
        grid: { xs: "w-full", sm: "w-full" },
      },

      {
        name: "inlineNewConversations",
        label: I18n.t('definitions.settings.inline_conversation.label'),
        hint: I18n.t('definitions.settings.inline_conversation.hint'),
        type: "bool",
        grid: { xs: "w-full", sm: "w-full" },
      },
    ];
  };

  definitionsForStyling = () => {
    return [
      {
        name: "primary_customization_color",
        type: "color",
        handler: (color) => {
          this.props.updateMemSettings({ color: color });
        },
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "secondary_customization_color",
        type: "color",
        handler: (color) => {
          this.props.updateMemSettings({ color: color });
        },
        grid: { xs: "w-full", sm: "w-1/3" },
      },

      {
        name: "header_image",
        type: "upload",
        handler: (file) => this.uploadHandler(file, "header_image"),
        grid: { xs: "w-full", sm: "w-1/3" },
      },
    ];
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
            label: I18n.t("settings.app.app_settings"),
            content: (
              <SettingsForm
                title={"General app's information"}
                currentUser={this.props.currentUser}
                data={this.props.app}
                update={this.update.bind(this)}
                fetchApp={this.fetchApp}
                classes={this.props.classes}
                definitions={this.definitionsForSettings}
                {...this.props}
              />
            ),
          },
          {
            label: I18n.t("settings.app.security"),
            content: (
              <SettingsForm
                title={"Security Settings"}
                hint={"Security"}
                currentUser={this.props.currentUser}
                data={this.props.app}
                update={this.update.bind(this)}
                fetchApp={this.fetchApp}
                classes={this.props.classes}
                definitions={this.definitionsForSecurity}
                {...this.props}
              />
            ),
          },
          {
            label: I18n.t("settings.app.appearance"),
            content: (
              <SettingsForm
                title={I18n.t("settings.app.appearance_title")}
                currentUser={this.props.currentUser}
                data={this.props.app}
                update={this.update.bind(this)}
                fetchApp={this.fetchApp}
                classes={this.props.classes}
                definitions={this.definitionsForAppearance}
                {...this.props}
              />
            ),
          },
          {
            label: I18n.t("settings.app.translations"),
            content: (
              <LanguageSettings
                settings={this.props.app}
                update={this.update}
                namespace={"app"}
                fields={["locale", "greetings", "intro", "tagline"]}
              />
            ),
          },
          {
            label: I18n.t("settings.app.availability"),
            content: (
              <AvailabilitySettings
                settings={this.props.app}
                update={this.update}
                namespace={"app"}
                fields={["greetings", "intro", "tagline"]}
              />
            ),
          },
          {
            label: I18n.t("settings.app.email_requirement"),
            content: (
              <EmailRequirement
                settings={this.props.app}
                update={this.update}
                namespace={"app"}
              />
            ),
          },
          {
            label: I18n.t("settings.app.inbound_settings"),
            content: (
              <InboundSettings
                settings={this.props.app}
                update={this.update}
                namespace={"app"}
              />
            ),
          },
          {
            label:  I18n.t("settings.app.messenger_style"),
            content: (
              <StylingSettings
                settings={this.props.app}
                update={this.update}
                namespace={"app"}
              />
            ),
          },
          {
            label:  I18n.t("settings.app.user_data"),
            content: (
              <UserData
                settings={this.props.app}
                update={this.update}
                namespace={"app"}
              />
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
            <ContentHeader title={I18n.t("settings.app.app_settings")} />

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
