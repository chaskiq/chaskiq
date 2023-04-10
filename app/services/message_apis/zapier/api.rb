# frozen_string_literal: true

require "rack/mime"

module MessageApis::Zapier
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    PROVIDER = "zapier"

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

    def self.definition_info
      {
        name: "Zapier",
        capability_list: %w[inbox],
        tag_list: [
          "conversations.started",
          "conversations.assigned",
          "conversations.added",
          "conversations.closed",
          "users.created",
          "conversation.user.first.comment"
        ],
        description: "Interfaces Zapier template",
        icon: "https://logo.clearbit.com/zapier.com",
        state: "enabled",
        definitions: [
          {
            name: "access_token",
            type: "string",
            label: "Password",
            hint: "Put a password to be used in the Zapier auth",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }

        ]
      }
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
        serialized_contact(r)
      when "new_conversation"
        r = create_conversation(app, params)
        serialized_conversation(r)
      when "perform_list"
        polling_sample(params).as_json
      when "subscribe"
        handle_subscription_hook(params, package)
      when "unsubscribe"
        handle_unsubscription_hook(params, package)
      else
        if params[:auth].present?
          if package.access_token === params[:auth]
            return { status: :ok, app_name: app.name }
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
      when "conversations.started", "conversations.assigned", "conversations.added", "conversations.closed"
        notify_conversation_trigger(event: event)
      when "conversation.user.first.comment"
        handle_channel_creation(event, subject)
      end
    end

    def handle_channel_creation(event, subject)
      check_and_create_channel(subject, event) if @package.settings[:new_message].present?
    end

    def check_and_create_channel(subject, event)
      subject.conversation_channels.find_or_create_by(provider: PROVIDER, provider_channel_id: subject.id)
    end

    def process_event(params, package)
      @package = package
      current = params["current"]
      process_message(params, @package)
    end

    def send_message(conversation, part)
      if ((url = @package.settings["new_message"])) && url.present?
        a = post(url, serialized_message(part))
        a if a.success?
      end
    end

    def get_message_id(data)
      data["id"]
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

    def polling_sample(params)
      case params[:event_type]
      when "new_contact", "user_created", "contact_created" then user_polling
      when "new_conversation", "conversation_started", "conversation_closed", "conversation_assigned"
        conversation_polling
      when "new_message"
        message_polling
      end
    end

    def message_polling
      list = [
        @package.app.conversation_parts.where(messageable_type: "ConversationPartContent").limit(2),
        @package.app.conversation_parts.where(messageable_type: "ConversationPartBlock").limit(2),
        @package.app.conversation_parts.where(messageable_type: "ConversationPartEvent").limit(2)
      ].flatten.compact

      serialized_message(list)
    end

    def user_polling
      serialized_contact(@package.app.app_users.limit(2))
    end

    def conversation_polling
      serialized_conversation(@package.app.conversations.limit(2))
    end

    ### triggers notification
    def notify_user_created_trigger_hook(event:)
      event_identifier, url = event_identifier_available?(event)

      return if event_identifier.blank?

      data = serialized_contact(event.eventable)

      return if url.blank?

      post(url, data)
    end

    def notify_conversation_trigger(event:)
      event_identifier, url = event_identifier_available?(event)
      return if event_identifier.blank?
      return if url.blank?

      subject = event.eventable

      data = serialized_conversation(subject)

      post(url, data)
    end

    def serialized_contact(object)
      object.as_json(
        only: %i[
          id
          key
          state
        ],
        methods: %i[
          email
          phone
          company_name
          last_name
          first_name
          avatar_url
          display_name
        ]
      )
    end

    def serialized_conversation(object)
      object.as_json(
        only: %i[
          key
          state
        ],
        methods: %i[
          subject
          priority
          closed_at
          assignee
          main_participant
          state
        ]
      )
    end

    def serialized_message(object)
      object.as_json(
        only: %i[
          key
          conversation_id
        ],
        methods: %i[
          messageable
          authorable
        ]
      )
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
