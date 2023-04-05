# frozen_string_literal: true

require "rack/mime"

module MessageApis::GoBot
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    PROVIDER = "go_bot"

    attr_accessor :url, :api_key, :client

    def initialize(config:)
      @package = config[:package]

      @client = MessageApis::GoBot::GoClient.new

      self
    end

    def register_webhook(app_package, integration); end

    def unregister(app_package, integration)
      # delete_webhooks
    end

    def process_event(params, package)
      @package = package
      current = params["current"]
      process_message(params, @package)
    end

    def send_message(conversation, part)
      return if part.private_note?

      message = part.message.as_json
      # TODO: implement event format
    end

    def trigger(event)
      subject = event.eventable
      action = event.action

      Rails.logger.info "EVENTTTT: #{action}"

      case action
      # when "visitors.convert" then notify_new_lead(subject)
      when "conversation.user.first.comment" then notify_added(subject)
        # when "conversations.added" then notify_added(subject)
      end
    end

    def notify_added(conversation)
      # TODO: handle this only on UI ?
      # add an option on app parent definition to add this by default??

      # message = conversation.messages.where.not(
      #  authorable_type: "Agent"
      # ).last

      # participant = conversation.main_participant

      # conversation.conversation_channels.create({
      #  provider: 'go_bot',
      #  provider_channel_id: conversation.id
      # })
    end

    def locked_for_channel?(conversation, part)
      if part.authorable.is_a?(Agent) && !part.authorable.bot?
        conversation.conversation_channels.find_by({
                                                     provider: PROVIDER,
                                                     provider_channel_id: conversation.id
                                                   }).destroy

        # assign and return , bot conversation over
        # conversation.assign_user(part.authorable)
        true
      end
    end

    def get_gpt_response(prompt, data, user_key)
      system_prompt = { role: "system", content: prompt }
      messages = []
      messages << system_prompt
      messages << data
      Rails.logger.debug messages
      @client.initiate_conversation(messages.flatten)
    end

    def notify_message(conversation:, part:, channel:)
      gpt_channel = conversation.conversation_channels.find_by(provider: PROVIDER)
      return if gpt_channel.blank?
      return unless part.messageable.is_a?(ConversationPartContent)
      return true if locked_for_channel?(conversation, part)
      return if part.conversation_part_channel_sources.where(provider: PROVIDER).any?

      Rails.logger.info "NOTIFY MESSAGE #{PROVIDER} #{part.id}"

      unless part.authorable.is_a?(Agent)

        previous = previous_messages(conversation, part)

        parsed_content = part&.message&.parsed_content
        human_input = parsed_content["blocks"]
        human_input = human_input&.map do |o|
          o["text"]
        end&.join(" ")

        messages = previous << { role: "user", content: human_input }

        Rails.cache.write("/conversation/#{conversation.key}/#{PROVIDER}", messages)

        Rails.logger.info "PROMPT: #{messages}"

        gpt_result = get_gpt_response(gpt_channel.data["prompt"], messages, part.authorable.id.to_s)

        Rails.logger.info(gpt_result)
        text = gpt_result
        # begin
        #  gpt_result["choices"].first["message"]["content"]
        # rescue StandardError
        #  nil
        # end

        return if text.nil?

        blocks = {
          blocks: [
            serialized_block(text)
          ].flatten.compact
        }.to_json

        add_message(
          conversation: conversation,
          from: conversation.app.agents.bots.first,
          text: text,
          blocks: blocks,
          message_id: nil
        )
      end
    end

    def previous_messages(conversation, part)
      Rails.cache.fetch("/conversation/#{conversation.key}/#{PROVIDER}", expires_in: 1.hour) do
        messages = conversation.messages.where(
          messageable_type: "ConversationPartContent"
        ).where.not(id: part.id)
                               .order("id")

        messages.map do |m|
          {
            "content" => m.message.text_from_serialized,
            "role" => m.authorable_type == "Agent" ? "assistant" : "user"
          }
        end
      end
    end

    def add_message(conversation:, from:, text:, blocks:, message_id:)
      # TODO: serialize message
      conversation.transaction do
        conversation.add_message(
          from: from,
          message: {
            html_content: text,
            serialized_content: blocks
          },
          provider: PROVIDER,
          message_source_id: message_id,
          check_assignment_rules: true
        )
      end
    end
  end
end
