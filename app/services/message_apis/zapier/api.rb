# frozen_string_literal: true

require "rack/mime"

module MessageApis::Zapier
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    attr_accessor :url, :api_key, :conn

    def initialize(config:)
      @package = config[:package]

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )

      @conn.headers = {
        "Content-Type" => "application/json",
        "Accept" => "application/json"
      }

      self
    end

    def create_hook_from_params
      { a: "olii" }
    end

    def response_with_text?
      true
    end

    def register_webhook(app_package, integration); end

    def unregister(app_package, integration)
      # delete_webhooks
    end

    def process_message(params, package)
      app = package.app
      case params[:event]
      when "create_contact"
        r = create_contact(app, params)
        r.as_json(methods: %i[email phone company_name last_name first_name avatar_url display_name])
      when "perform_list"
        [].to_s
      # when "event_action"
      else
        {}
      end
    end

    def enqueue_process_event(params, package)
      process_event(params, package)

      # HookMessageReceiverJob.perform_later(
      #  id: package.id,
      #  params: params.permit!.to_h
      # )
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def process_event(params, package)
      @package = package
      current = params["current"]
      process_message(params, @package)
    end

    def send_message(conversation, message)
      # TODO: implement event format
    end

    def create_contact(app, params)
      user = app.app_users.find_or_initialize_by(email: params[:email])
      user.assign_attributes(
        last_name: params[:last_name],
        first_name: params[:first_name],
        phone: params[:phone],
        type: "AppUser"
      )
      user.save
      user
    end
  end
end
