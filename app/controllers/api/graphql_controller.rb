# frozen_string_literal: true

require 'browser/aliases'

class Api::GraphqlController < ApiController
  before_action :get_app
  # before_action :authorize!

  def execute
    variables = ensure_hash(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]

    scout_transaction_name = "GraphQLAPI" + (operation_name || 'unknown')
    ScoutApm::Transaction.rename(scout_transaction_name)
  
    context = {
      # Query context goes here, for example:
      user_data: user_data,
      app: @app,
      from_api: true,
      set_locale: -> { set_locale },
      auth: -> { auth },
      get_app_user: -> { get_app_user },
      current_user: get_app_user,
      request: request
    }

    result = ChaskiqSchema.execute(query,
                                   variables: variables,
                                   context: context,
                                   operation_name: operation_name)
    # max_depth: 5

    render json: result
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
  rescue OriginValidator::NonAcceptedOrigin => e
    # GraphQL::ExecutionError.new e.message

    render json: {
      errors: [{
        message: e.message,
        data: {}
      }]
    }, status: 422
    # GraphQL::ExecutionError.new "Validation failed: #{error_messages}."

  rescue EULocationError => e

    render json: {
      errors: [{
        message: e.message,
        data: {}
      }]
    }, status: 422
  rescue StandardError => e
    # GraphQL::ExecutionError.new e.message
    # raise e unless Rails.env.development?
    handle_error_message e
  end

  private

  def auth
    valid_origin?
    @user_data = get_user_data_from_auth
  end

  attr_reader :user_data

  def get_app
    @app = App.find_by(key: request.headers['HTTP_APP'])
  end

  def set_host_for_local_storage
    ActiveStorage::Current.host = request.base_url if Rails.application.config.active_storage.service == :local
  end

  # Handle form data, JSON body, or a blank value
  def ensure_hash(ambiguous_param)
    case ambiguous_param
    when String
      if ambiguous_param.present?
        ensure_hash(JSON.parse(ambiguous_param))
      else
        {}
      end
    when Hash, ActionController::Parameters
      ambiguous_param
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{ambiguous_param}"
    end
  end

  def handle_error_message(e)
    logger.error e.message
    logger.error e.backtrace.join("\n")

    render json: {
      error: {
        message: e.message,
        backtrace: Rails.env.production? ? nil : e.backtrace.join("\n")
      },
      data: {}
    }, status: 500
  end
end
