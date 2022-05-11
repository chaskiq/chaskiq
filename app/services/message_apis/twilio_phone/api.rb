# frozen_string_literal: true

require "rack/mime"

module MessageApis::TwilioPhone
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    attr_accessor :url, :api_key, :conn

    PROVIDER = "TwilioPhone"

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

    def register_webhook(app_package, integration); end

    def unregister(app_package, integration)
      # delete_webhooks
    end

    def trigger(event)
      # case event.action
      # when 'email_changed' then register_contact(event.eventable)
      # end
    end

    def enqueue_process_event(params, package)
      return process_event(params, package) if params["CallStatus"].present?

      HookMessageReceiverJob.perform_later(
        id: package.id,
        params: params.permit!.to_h
      )
      { status: :ok }
    end

    def process_event(params, package)
      @package = package
      process_message(params, @package)
    end

    def send_message(conversation, part)
      return if part.private_note?

      message = part.message.as_json
      nil # nil does not send anything
    end

    def process_message(params, package)
      # call events handler
      return process_incoming_event(params) if params[:StatusCallbackEvent].present?

      app = package.app
      # caller initiators

      # for agent
      if params[:Caller] == "client:support_agent"
        conversation = Conversation.find_by(key: params[:name])

        MessageApis::TwilioPhone::Store.set(
          conversation.key,
          params[:CallSid],
          params[:chaskiq_agent]
        )

        unique_list = MessageApis::TwilioPhone::Store.locked_agents(@package.app.key)
        unique_list.append(params[:chaskiq_agent])

        # turn agent not available
        agent = app.agents.find(params[:chaskiq_agent])
        agent.update(available: false)

        # assign agent unless already assigned
        conversation.assign_user(agent) if conversation.assignee.blank?

        return conference_call(params, conversation, {
                                 message: "Hi, we are connecting you to the conversation now"
                               })
      end

      # for users
      return process_incoming_call(params) if params["CallSid"] && params["CallStatus"]
    end

    def process_incoming_call(payload)
      channel_id = payload[:CallSid]
      phone_number = payload[:Caller]
      app = @package.app

      conversation = nil

      text = "new conversation!"

      serialized_content = text_block(text)
      user_data = {
        "id" => phone_number,
        "first_name" => "twilio:#{phone_number}"
      }

      participant = add_participant(user_data, PROVIDER)

      conversation = app.conversations.create(
        main_participant: participant,
        conversation_channels_attributes: [
          provider: PROVIDER,
          provider_channel_id: channel_id # phone_number
        ]
      )

      author = app.agents.first

      message = conversation.add_message(
        from: author,
        controls: {
          app_package: "TwilioPhone",
          schema: [
            {
              type: "content"
            }
          ],
          type: "app_package",
          wait_for_input: true
        }
      )

      MessageApis::TwilioPhone::Store.set_callblock(
        conversation.key,
        message.id
      )

      locked_ids = MessageApis::TwilioPhone::Store.locked_agents(app.key).elements
      agents = app.agents.humans.where.not(id: locked_ids)

      agents.each do |agent|
        params = {
          subject: "New conversation call",
          message: "#{PROVIDER} new call",
          timeout: 5500,
          actions: [
            { type: "navigate", path: "/apps/#{app.key}/conversations/#{conversation.key}", label: "Go to conversation", tone: "indigo" },
            { type: "close", label: "Dismiss" }
          ]
        }
        app.notify_agent_notification(agent, params)
      end

      conference_call(payload, conversation, {
                        message: "Thanks for calling to #{app.name}!"
                      })
    end

    def process_incoming_event(payload)
      conversation = @package.app.conversations.find_by(key: payload["FriendlyName"])

      # return if conversation && conversation.conversation_part_channel_sources
      #                                      .find_by(message_source_id: channel_id.to_s).present?

      conversation.add_message_event(
        action: payload["StatusCallbackEvent"],
        provider: PROVIDER,
        message_source_id: "bypass-internal-#{payload['CallSid']}-#{payload['SequenceNumber']}",
        data: {
          status: payload["StatusCallbackEvent"]
        }
      )

      # this will trigger an event on the view
      ActionCable.server.broadcast "events:#{@package.app.key}", {
        type: "/package/TwilioPhone",
        app: @package.app.key,
        payload:,
        event_type: "INIT"
      }

      case payload["StatusCallbackEvent"]
      when "conference-end"
        values = MessageApis::TwilioPhone::Store.hash(payload["FriendlyName"]).values

        unique_list = MessageApis::TwilioPhone::Store.locked_agents(@package.app.key)

        # here we are assuming that every agent that we will unlock will be available
        begin
          @package.app.agents.find(unique_list.elements).update_all(available: true)
        rescue StandardError
          nil
        end

        # remove list
        unique_list.remove(values)

        MessageApis::TwilioPhone::Store.hash(payload["FriendlyName"]).remove

        modify_message_block_part(conversation)

      else
        Rails.logger.debug { "NO STORE HANDLED FOR #{payload['StatusCallbackEvent']}" }
      end
    end

    def modify_message_block_part(conversation)
      block_id = MessageApis::TwilioPhone::Store.callblock(
        conversation.key
      )

      # modify block
      block_part = ConversationPart.find(block_id).message
      block_part.blocks = block_part.blocks.merge({ "schema" => [
                                                    "type" => "text",
                                                    "text" => "Call ended"
                                                  ] })
      block_part.save_replied(nil)

      # delete redis key
      MessageApis::TwilioPhone::Store.del_callblock(conversation.key)
    end

    def conference_call(params, conversation, opts)
      response = Twilio::TwiML::VoiceResponse.new
      response.say(message: opts[:message]) if opts[:message].present?
      # response.say(message: 'other message here')

      response.dial do |dial|
        name = conversation.key

        hook_url = @package.hook_url # .gsub("http://localhost:3000", "https://chaskiq.ngrok.io")

        dial.conference(name,
                        beep: false,
                        end_conference_on_exit: true,
                        statusCallback: hook_url,
                        statusCallbackEvent: "start end join leave mute hold")
      end

      { format: :xml, response: }
    end

    ## client

    def conferences_list
      account_sid = @package.settings["account_sid"]
      auth_token = @package.settings["auth_token"]
      client = Twilio::REST::Client.new(account_sid, auth_token)

      # conferences = @client.conferences.list(limit: 20)

      client.conferences.list(
        date_created_after: 3.hours.ago,
        status: "in-progress",
        limit: 60
      )

      # conferences.each do |record|
      #  Rails.logger.debug record.sid
      # end
    end
  end
end
