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

    # this is called when create a conversation from profile
    def prepare_block_initiator_channel_for(conversation, pkg, initiator_block)
      conversation.add_message(
        from: pkg.app.agents.bots.first,
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
    end

    def enqueue_process_event(params, package)
      return process_event(params, package) if params["StatusCallbackEvent"].present?
      return process_event(params, package) if params["CallStatus"].present?
      return process_hold(params, package) if params["type"] == "hold"

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

    def process_hold(params, package)
      conference_sid = MessageApis::TwilioPhone::Store.get_data(params[:conversation_key], :conference_sid)
      participant_sid = package.app.conversations.find_by(key: params[:conversation_key]).conversation_channels.find_by(provider: "TwilioPhone").provider_channel_id

      client.api.conferences(conference_sid).participants(participant_sid).update(hold: params[:hold_action])

      MessageApis::TwilioPhone::Store.set_data(
        params[:conversation_key],
        :holdStatus,
        params[:hold_action]
      )
      # send notification here
      { status: :ok }
    end

    def send_message(conversation, part)
      return if part.private_note?

      message = part.message.as_json
      nil # nil does not send anything
    end

    def new_call(profile_id, conversation = nil)
      q = conversation.present? ? conversation.key : ""

      hook_url = @package.hook_url.gsub("http://localhost:3000", "https://chaskiq.ngrok.io")

      client.calls.create(
        url: "#{hook_url}?c=#{q}",
        to: profile_id,
        from: @package.settings[:phone_number],
        status_callback_event: "<Response><Say>Hello</Say></Response>",
        status_callback: "#{hook_url}?c=#{q}"
      )
    end

    def process_message(params, package)
      if params["chaskiq_action"] == "new"
        conversation = Conversation.find_by(key: params["name"])
        profile_id = conversation.main_participant.external_profiles.find_by(provider: "TwilioPhone")&.profile_id
        # new_call(profile_id, conversation)
        return conference_call(params, conversation, {})
      end

      # hook handler for outbound calls from agent this is triggered when the callee pick up
      return process_outbound_call(params, "outbound") if params["Direction"] == "outbound-api"

      # call events handler
      return process_incoming_event(params) if params[:StatusCallbackEvent].present? && params[:Caller] != "client:support_agent"

      app = package.app
      # caller initiators
      Rails.logger.debug params
      # for agent
      if params[:Caller] == "client:agent"

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
                                 message: "Hi, we are connecting you to the conversation now",
                                 end_conference_on_exit: false
                               })
      end

      # for users
      return process_inbound_call(params) if params["CallSid"] && params["CallStatus"]
    end

    def process_incoming_call(payload, direction)
      app = @package.app
      channel_id = payload[:CallSid]

      case direction
      when "inbound"
        phone_number = payload[:Caller]
      when "outbound"
        phone_number = payload[:Called]
      end

      conversation = nil

      text = "new conversation!"

      serialized_content = text_block(text)
      user_data = {
        "id" => phone_number,
        "first_name" => "twilio:#{phone_number}"
      }

      participant = add_participant(user_data, PROVIDER)
      participant.update(phone: user_data["id"])

      # when the outbound call carries a conversation key
      conversation = if payload[:c].present?
                       Conversation.find_by(key: payload[:c])
                     else
                       app.conversations.create(
                         main_participant: participant,
                         conversation_channels_attributes: [
                           provider: PROVIDER,
                           provider_channel_id: channel_id # phone_number
                         ]
                       )
                     end

      author = app.agents.first

      if direction != "outbound" || payload[:c].blank?
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

        # MessageApis::TwilioPhone::Store.set_data(
        #  conversation.key,
        #  :callblock,
        #  message.id
        # )

      end

      ## set the caller record
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

    # this handles the outbound call
    def process_outbound_call(payload, direction = "outbound")
      process_incoming_call(payload, direction)
    end

    # this handles the inbound call
    def process_inbound_call(payload, direction = "inbound")
      process_incoming_call(payload, direction)
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

      MessageApis::TwilioPhone::Store.set_data(
        payload["FriendlyName"],
        :conference_sid,
        payload["ConferenceSid"]
      )

      # this will trigger an event on the view
      ActionCable.server.broadcast "events:#{@package.app.key}", {
        type: "/package/TwilioPhone",
        app: @package.app.key,
        payload: payload,
        conference: conference_object(payload),
        event_type: "INIT",
        agent_id: MessageApis::TwilioPhone::Store.get(conversation.key, payload["CallSid"])
      }

      case payload["StatusCallbackEvent"]
      # when "participant-join"

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

        modify_message_block_part(conversation)

        MessageApis::TwilioPhone::Store.hash(payload["FriendlyName"]).remove
        MessageApis::TwilioPhone::Store.data(payload["FriendlyName"]).remove

      when "participant-hold"
        #  cli.conferences.list.first.participants.list.first.update(hold: false)

        # AccountSid	xx
        # CallSid	xx
        # Coaching	false
        # ConferenceSid	xx
        # EndConferenceOnExit	true
        # FriendlyName	fnKwXndKiG19HjQ2LvwkDmpv
        # Hold	false
        # Muted	false
        # SequenceNumber	7
        # StartConferenceOnEnter	true
      when "participant-unhold"
        # AccountSid	xx
        # CallSid	xx
        # Coaching	false
        # ConferenceSid	xx
        # EndConferenceOnExit	true
        # FriendlyName	fnKwXndKiG19HjQ2LvwkDmpv
        # Hold	false
        # Muted	false
        # SequenceNumber	7
        # StartConferenceOnEnter	true
      else
        Rails.logger.debug { "NO STORE HANDLED FOR #{payload['StatusCallbackEvent']}" }
      end
    end

    def modify_message_block_part(conversation)
      conversation.message_blocks
                  .where(state: nil)
                  .find_each do |block_part|
        # modify block
        block_part.blocks = block_part.blocks.merge({ "schema" => [
                                                      "type" => "text",
                                                      "text" => "Call ended"
                                                    ] })
        block_part.save_replied(nil)
      end

      # block_id = MessageApis::TwilioPhone::Store.get_data(
      #  conversation.key,
      #  :callblock
      # )

      # return if block_id.blank?

      # modify block
      # block_part = ConversationPart.find(block_id).message
      # block_part.blocks = block_part.blocks.merge({ "schema" => [
      #                                             "type" => "text",
      #                                             "text" => "Call ended"
      #                                           ] })
      # block_part.save_replied(nil)
    end

    def conference_call(params, conversation, opts)
      response = Twilio::TwiML::VoiceResponse.new
      response.say(message: opts[:message]) if opts[:message].present?

      end_conference_on_exit = opts.keys.include?(:end_conference_on_exit) ? opts[:end_conference_on_exit] : true

      response.dial do |dial|
        name = conversation.key

        hook_url = @package.hook_url.gsub("http://localhost:3000", "https://chaskiq.ngrok.io")

        dial.conference(name,
                        beep: true,
                        end_conference_on_exit: end_conference_on_exit,
                        statusCallback: hook_url,
                        statusCallbackEvent: "start end join leave mute hold")
      end

      { format: :xml, response: response }
    end

    ## client

    def client
      account_sid = @package.settings["account_sid"]
      auth_token = @package.settings["auth_token"]
      @client = Twilio::REST::Client.new(account_sid, auth_token)
    end

    def conferences_list
      account_sid = @package.settings["account_sid"]
      auth_token = @package.settings["auth_token"]
      client = Twilio::REST::Client.new(account_sid, auth_token)

      client.conferences.list(
        date_created_after: 5.hours.ago,
        status: "in-progress",
        limit: 60
      )
    end

    def conference_object(payload)
      if payload["StatusCallbackEvent"] == "participant-join"
        conference = client.conferences(payload["ConferenceSid"]).fetch
        self.class.conference_json_item(conference, @package)
      end
    end

    def self.conversation_url(app, conf)
      "/apps/#{app.key}/conversations/#{conf.friendly_name}"
    end

    def self.conference_json_item(conf, package)
      @package = package

      conversation = Conversation.find_by(key: conf.friendly_name)
      return nil if conversation.blank?

      agent_ids = MessageApis::TwilioPhone::Store.hash(conf.friendly_name).values
      agents = conversation.app.agents.where(id: agent_ids)
      {
        url: "#{Chaskiq::Config.get(:host)}/package_iframe/TwilioPhone?token=#{frame_token(conf)}",
        update_url: "#{Chaskiq::Config.get(:host)}/package_iframe/TwilioPhone?token=#{frame_token(conf, :update)}",
        conference: {
          sid: conf.sid,
          status: conf.status,
          hold_status: MessageApis::TwilioPhone::Store.get_data(conversation.key, :holdStatus),
          fiendly_name: conf.friendly_name,
          url: conversation_url(package.app, conf)
        },
        key: conversation.key,
        agent_ids: agent_ids,
        agent_names: agents&.map(&:display_name) || [],
        conversation: conversation.as_json,
        participant: conversation.main_participant.as_json,
        profile: conversation.main_participant.external_profiles.find_by(provider: "TwilioPhone").as_json
      }
    end

    def self.frame_token(conf, action = nil)
      data = {
        app_id: @package.app.id,
        package_id: @package.id,
        conversation_key: conf.friendly_name,
        # lang: @lang,
        # current_user: @user,
        action: action
      }

      CHASKIQ_FRAME_VERIFIER.generate(data)
    end

    def self.token(package)
      generate_access_token(package)
    end

    def self.generate_access_token(package)
      settings = package.settings
      # Create Voice grant for our token
      grant = Twilio::JWT::AccessToken::VoiceGrant.new
      grant.outgoing_application_sid = settings["application_sid"]

      # Optional: add to allow incoming calls
      grant.incoming_allow = true

      # Create an Access Token
      token = Twilio::JWT::AccessToken.new(
        settings["account_sid"],
        settings["api_key"],
        settings["api_secret"],
        [grant],
        identity: "agent"
      )

      token.to_jwt
    end

    def self.find_or_create_profile(conversation, package)
      participant = conversation.main_participant
      profile = participant.external_profiles.find_by(provider: "TwilioPhone")
      if profile.blank?
        raise "invalid phone" if participant.phone.blank?
        raise "invalid phone" unless Phonelib.valid?(participant.phone)

        profile = conversation.app.external_profiles.find_by(provider: "TwilioPhone", profile_id: participant.phone)
        profile.presence || profile = participant.external_profiles.create(provider: "TwilioPhone", profile_id: participant.phone)
      end
      profile
    end

    def self.get_profile(conversation, package)
      profile = conversation.main_participant.external_profiles.find_by(provider: "TwilioPhone")
      # when a user has a phone number but not a profile , lets create a new conversation for the valid user or create a new profile in this conversation
      if profile.blank?
        raise "invalid phone" if conversation.main_participant.phone.blank?
        raise "invalid phone" unless Phonelib.valid?(conversation.main_participant.phone)

        profile = conversation.app.external_profiles.find_by(provider: "TwilioPhone", profile_id: conversation.main_participant.phone)
        if profile.present?
          conversation = conversation.app.conversations.create(
            main_participant: profile.app_user,
            conversation_channels_attributes: [
              provider: "TwilioPhone",
              provider_channel_id: profile.profile_id # phone_number
            ]
          )
          @conversation_key = conversation.key
        else
          profile = conversation.main_participant.external_profiles.create(provider: "TwilioPhone", profile_id: conversation.main_participant.phone)
        end
      end

      [conversation, profile]
    end
  end
end
