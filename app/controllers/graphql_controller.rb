# frozen_string_literal: true

class GraphqlController < ApplicationController
  include HashEnsurer
  skip_before_action :verify_authenticity_token
  # before_action :doorkeeper_authorize!
  before_action :set_host_for_local_storage
  before_action :set_locale

  def execute
    variables = ensure_hash(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]

    scout_transaction_name = 'GraphQL/' + (operation_name || 'unknown')
    ScoutApm::Transaction.rename(scout_transaction_name)

    context = {
      # Query context goes here, for example:
      current_user: current_user,
      doorkeeper_authorize: -> { api_authorize! },
      enabled_subscriptions: enabled_subscriptions?
    }

    result = ChaskiqSchema.execute(query,
                                   variables: variables,
                                   context: context,
                                   operation_name: operation_name)

    render json: result
    # rescue => e
    #  raise e unless Rails.env.development?
    #  handle_error_message e
    # end

    # rescue CanCan::AccessDenied => e
    #  render json: {
    #    errors: [{
    #              message: e.message,
    #              data: {}
    #            }]
    #  }, status: 200
  rescue OauthExeption => e
    render json: {
      error: {
        message: 'token not valid'
      }, data: {}
    }, status: 401
  rescue ActiveRecord::RecordNotFound => e
    render json: {
      errors: [{
        message: 'Data not found',
        data: {}
      }]
    }, status: 200
  rescue ActiveRecord::RecordInvalid => e
    error_messages = e.record.errors.full_messages.join("\n")
    json_error e.record
  rescue Plan::PlanError => e
    render json: {
      error: {
        message: JSON.parse(e.message)
      }, data: {}
    }, status: 402
  # GraphQL::ExecutionError.new "Validation failed: #{error_messages}."
  rescue ActionPolicy::Unauthorized => e
    raise GraphQL::ExecutionError.new(
      # use result.message (backed by i18n) as an error message
      e.result.message,
      # use GraphQL error extensions to provide more context
      extensions: {
        code: :unauthorized,
        fullMessages: e.result.reasons.full_messages,
        details: e.result.reasons.details
      }
    )
  rescue StandardError => e
    # GraphQL::ExecutionError.new e.message
    # raise e unless Rails.env.development?
    handle_error_message e
  end

  private

  def api_authorize!
    resource = current_resource_owner
    raise OauthExeption, 'Oauth Exception!' unless resource

    # doorkeeper_authorize!
    resource
  end

  def set_host_for_local_storage
    ActiveStorage::Current.host = request.base_url if Rails.application.config.active_storage.service == :local
  end
end

class OauthExeption < StandardError
  def initialize(msg = 'This is a custom exception', exception_type = 'custom')
    @exception_type = exception_type
    super(msg)
  end
end
