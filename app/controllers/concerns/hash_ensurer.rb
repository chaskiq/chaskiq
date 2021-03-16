# frozen_string_literal: true

module HashEnsurer
  extend ActiveSupport::Concern

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

  def handle_error_message(err)
    logger.error err.message
    logger.error err.backtrace.join("\n")

    render json: {
      error: {
        message: err.message,
        backtrace: Rails.env.production? ? nil : err.backtrace.join("\n")
      },
      data: {}
    }, status: 500
  end
end
