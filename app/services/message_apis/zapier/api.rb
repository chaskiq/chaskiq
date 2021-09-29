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
      when "new_conversation"
        r = create_conversation(app, params)
        r.as_json
      when "perform_list"
        [].to_s
      when "subscribe"
        handle_subscription_hook(params, package)
      when "unsubscribe"
        handle_unsubscription_hook(params, package)
      else
        if params[:auth].present?
          if package.access_token === params[:auth]
            return { status: :ok }
          else
            return { status: :error, message: "auth key invalid" }
          end
        end
        { status: :unhandled }
      end
    end

    def handle_subscription_hook(params, package)
      package.settings[params[:event_type].to_sym] = params["hookUrl"]
      { status: :ok } if package.save
    end

    def handle_unsubscription_hook(params, package)
      package.settings.delete(params[:event_type].to_sym)
      { status: :ok } if package.save
    end

    def enqueue_process_event(params, package)
      process_event(params, package)

      # HookMessageReceiverJob.perform_later(
      #  id: package.id,
      #  params: params.permit!.to_h
      # )
    end

    def trigger(event)
      subject = event.eventable
      action = event.action
      case action
      when "users.created" then notify_user_created_trigger_hook(event: event)
      when "conversations.assigned", "conversations.added", "conversations.closed"
        notify_conversation_trigger(event: event)
      end
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

    def create_conversation(app, params)
      email = params[:contact_email]
      text = params[:text]
      first_name = params[:first_name]
      last_name = params[:last_name]

      app_user = app.add_user(
        email: email,
        first_name: first_name,
        last_name: last_name
      )
      app_user.save

      conversation = app.start_conversation(
        message: {
          html_content: text,
          text_content: text
        },
        from: app_user
      )
    end

    def event_identifier_available?(event)
      event_identifier = Event::EVENT_CONSTANTS.find do |o|
        o[:name] == event.action
      end
      return [nil, nil] if event_identifier.blank?

      url = @package.settings[event_identifier[:identifier].to_s]

      [event_identifier, url]
    end

    ### triggers notification
    def notify_user_created_trigger_hook(event:)
      event_identifier, url = event_identifier_available?(event)

      return if event_identifier.blank?

      data = event.eventable.as_json(
        methods: %i[first_name last_name email phone company_name]
      )

      return if url.blank?

      post(url, data)
    end

    def notify_conversation_trigger(event:)
      event_identifier, url = event_identifier_available?(event)
      return if event_identifier.blank?
      return if url.blank?

      data = event.eventable.as_json(
        methods: %i[
          key
          assignee
          main_participant
          state
        ]
      )
      post(url, data)
    end

    def post(url, data)
      @conn.post(
        url,
        data.to_json,
        "Content-Type" => "application/json"
      )
    end
  end
end
