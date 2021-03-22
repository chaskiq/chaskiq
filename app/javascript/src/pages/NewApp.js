import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import timezones from '../shared/timezones'

import graphql from '../graphql/client'
import SettingsForm from '../pages/settings/form'
import { CREATE_APP } from '../graphql/mutations'

import { errorMessage, successMessage } from '../actions/status_messages'

import { clearApp } from '../actions/app'

import image from '../images/up-icon8.png'

class NewApp extends Component {
  state = {
    data: {}
  };

  componentDidMount () {
    this.props.dispatch(clearApp())
  }

  definitionsForSettings = () => {
    return [
      {
        name: 'name',
        label: I18n.t('definitions.settings.name.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' }
      },
      {
        name: 'domainUrl',
        label: I18n.t('definitions.settings.domain.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' }
      },
      {
        name: 'tagline',
        label: I18n.t('definitions.settings.tagline.label'),
        type: 'textarea',
        hint: I18n.t('definitions.settings.tagline.hint'),
        grid: { xs: 'w-full', sm: 'w-full' }
      },
      {
        name: 'timezone',
        type: 'timezone',
        label: I18n.t('definitions.settings.timezone.label'),
        options: timezones,
        multiple: false,
        grid: { xs: 'w-full', sm: 'w-full' }
      }
    ]
  };

  handleSuccess = () => {
    this.props.dispatch(successMessage('app created successfully'))
    this.props.history.push(`/apps/${this.state.data.app.key}`)
  };

  handleResponse = () => {
    this.state.data.app.key && this.handleSuccess()
  };

  handleData = (data) => {
    graphql(
      CREATE_APP,
      {
        appParams: data.app,
        operation: 'create'
      },
      {
        success: (data) => {
          this.setState(
            {
              data: data.appsCreate
            },
            () => this.handleResponse(data)
          )
        },
        error: (_error) => {
          this.props.dispatch(errorMessage('server error'))
        }
      }
    )
  };

  render () {
    return (
      <div>
        <div className="p-3 sm:m-16 sm:p-12 shadow rounded bg-white shadow flex">
          <div className="w-1/2 hidden sm:block">
            <div className="p-8 pt-0">
              <p className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:leading-none">
                {I18n.t('new_app.title')}
              </p>

              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">

                {I18n.t('new_app.text')}
              </p>

              <img
                src={image}
                style={{ width: '100%' }}
                alt=""
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2">

            <p className="sm:hidden text-3xl tracking-tight leading-10
            font-extrabold text-gray-900 sm:leading-none">
              {I18n.t('new_app.hint')}
            </p>

            <SettingsForm
              data={this.state.data}
              classes={this.props.classes}
              update={this.handleData}
              definitions={this.definitionsForSettings}
            />
          </div>
        </div>
      </div>
    )
  }
}

NewApp.contextTypes = {
  router: PropTypes.object
}

function mapStateToProps (state) {
  const { auth } = state
  const { isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(NewApp))
