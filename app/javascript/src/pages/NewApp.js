import PropTypes from "prop-types";
import React, { Component } from "react";

import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import timezones from "../shared/timezones";
import Button from "../components/Button";
import graphql from "../graphql/client";
import SettingsForm from "../pages/settings/form";
import { CREATE_APP } from "../graphql/mutations";

import { errorMessage, successMessage } from "../actions/status_messages";

import { clearApp } from "../actions/app";

import image from "../images/up-icon8.png";

class NewApp extends Component {
  state = {
    data: {},
  };

  componentDidMount() {
    this.props.dispatch(clearApp());
  }

  definitionsForSettings = () => {
    return [
      {
        name: "name",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" },
      },
      {
        name: "domainUrl",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" },
      },
      {
        name: "tagline",
        type: "textarea",
        hint: "messenger text on botton",
        grid: { xs: "w-full", sm: "w-full" },
      },

      {
        name: "timezone",
        type: "timezone",
        options: timezones,
        multiple: false,
        grid: { xs: "w-full", sm: "w-full" },
      },
      {
        name: "gatherSocialData",
        type: "bool",
        label: "Collect social data about your users",
        hint:
          "Collect social profiles (e.g. LinkedIn, Twitter, etc.) for my users via a third party",
        grid: { xs: "w-full", sm: "w-full" },
      },
    ];
  };

  handleSuccess = () => {
    this.props.dispatch(successMessage("app created successfully"));
    this.props.history.push(`/apps/${this.state.data.app.key}`);
  };

  handleResponse = () => {
    this.state.data.app.key && this.handleSuccess();
  };

  handleData = (data) => {
    graphql(
      CREATE_APP,
      {
        appParams: data.app,
        operation: "create",
      },
      {
        success: (data) => {
          this.setState(
            {
              data: data.appsCreate,
            },
            () => this.handleResponse(data)
          );
        },
        error: (error) => {
          this.props.dispatch(errorMessage("server error"));
        },
      }
    );
  };

  render() {
    return (
      <div>
        <div className="m-16 p-12 shadow rounded bg-white shadow flex">
          <div className="w-1/2">
            <div className="p-8 pt-0">
              <p className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:leading-none">
                Create your company’s Chaskiq app
              </p>

              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Provide basic information to setup Chaskiq for your team and
                customers.
              </p>

              <img
                src={image}
                class="is-pablo"
                style={{ width: "100%" }}
                alt=""
              />
            </div>
          </div>

          <div className="w-1/2">
            <SettingsForm
              data={this.state.data}
              classes={this.props.classes}
              update={this.handleData}
              definitions={this.definitionsForSettings}
            />
          </div>
        </div>
      </div>
    );
  }
}

NewApp.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  const { auth } = state;
  const { isAuthenticated } = auth;
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(NewApp));
