class GraphqlController < ApplicationController

  before_action :authorize_by_jwt

  def execute
    variables = ensure_hash(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]
    
    context = {
      # Query context goes here, for example:
      current_user: current_agent,
      #authorize: lambda{|mode, object| authorize!(mode, object) },
      #can: lambda{| mode, object | can?( mode, object) },
      #logout!: ->{logout!},
      #session: session,
      #request: request,
    }
    

    result = HermesSchema.execute(query, 
      variables: variables, 
      context: context, 
      operation_name: operation_name
    )
   
    render json: result
  #rescue => e
  #  raise e unless Rails.env.development?
  #  handle_error_in_development e
  #end

  #rescue CanCan::AccessDenied => e
  #  render json: { 
  #    errors: [{ 
  #              message: e.message,
  #              data: {}
  #            }] 
  #  }, status: 200    
  
  rescue ActiveRecord::RecordNotFound => e
    render json: { 
      errors: [{ 
        message: "Data not found",  
        data: {} 
      }]
    }, status: 200

  rescue ActiveRecord::RecordInvalid => e
    error_messages = e.record.errors.full_messages.join("\n")
    json_error e.record
    #GraphQL::ExecutionError.new "Validation failed: #{error_messages}."
  rescue StandardError => e
    #GraphQL::ExecutionError.new e.message
    #raise e unless Rails.env.development?
    handle_error_in_development e
  rescue => e
    raise e unless Rails.env.development?
    handle_error_in_development e
  end


  private

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
