# frozen_string_literal: true

class GraphqlDocsController < ApplicationController
  #skip_before_action :verify_authenticity_token
  before_action :set_host_for_local_storage

  def execute
    variables = ensure_hash(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]

    context = {}

    result = ChaskiqSchema.execute(query,
                                   variables: variables,
                                   context: context,
                                   operation_name: operation_name)

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
    # GraphQL::ExecutionError.new "Validation failed: #{error_messages}."
  rescue StandardError => e
    # GraphQL::ExecutionError.new e.message
    # raise e unless Rails.env.development?
    handle_error_in_development e
  rescue StandardError => e
    raise e unless Rails.env.development?

    handle_error_in_development e
  end

  private

  def set_host_for_local_storage
    if Rails.application.config.active_storage.service == :local
      ActiveStorage::Current.host = request.base_url
    end
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

  def handle_error_in_development(e)
    logger.error e.message
    logger.error e.backtrace.join("\n")

    render json: { error: { message: e.message, backtrace: e.backtrace }, data: {} }, status: 500
  end
end
