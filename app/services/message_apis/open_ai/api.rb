# frozen_string_literal: true

module MessageApis::OpenAi
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    BASE_URL = "https://api.openai.com"
    PROVIDER = "openai"

    attr_accessor :url, :api_secret, :conn

    def initialize(config:)
      @api_secret = config["api_secret"]

      @url = "#{BASE_URL}/v1/chat/completions"

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )
      self
    end

    def authorize!
      @conn.request :authorization, :Bearer, @api_secret
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
      authorize!

      # TODO: handle this only on UI ?
      # add an option on app parent definition to add this by default??

      # message = conversation.messages.where.not(
      #  authorable_type: "Agent"
      # ).last

      # participant = conversation.main_participant

      # conversation.conversation_channels.create({
      #  provider: 'open_ai',
      #  provider_channel_id: conversation.id
      # })
    end

    def locked_for_channel?(conversation, part)
      if part.authorable.is_a?(Agent) && !part.authorable.bot?
        conversation.conversation_channels.find_by({
                                                     provider: "open_ai",
                                                     provider_channel_id: conversation.id
                                                   }).destroy

        # assign and return , bot conversation over
        # conversation.assign_user(part.authorable)
        true
      end
    end

    def notify_message(conversation:, part:, channel:)
      gpt_channel = conversation.conversation_channels.find_by(provider: "open_ai")
      return if gpt_channel.blank?
      return unless part.messageable.is_a?(ConversationPartContent)
      return true if locked_for_channel?(conversation, part)
      return if part.conversation_part_channel_sources.where(provider: "open_ai").any?

      Rails.logger.info "NOTIFY MESSAGE OPEN AI #{part.id}"

      unless part.authorable.is_a?(Agent)
        #####
        ## cache this
        messages = conversation.messages.where(
          messageable_type: "ConversationPartContent"
        ).where.not(id: part.id).order("id")
        #####

        # conversation.conversation_channels.find_by(provider_channel_id: channel)
        # cache this thing:
        previous = messages.map do |m|
          {
            text: m.message.text_from_serialized,
            from: m.authorable_type
          }
        end
        previous = previous.map do |item|
          { role: item[:from] == "Agent" ? "assistant" : "user", content: item[:text] }
        end

        parsed_content = part&.message&.parsed_content
        human_input = parsed_content["blocks"]
        human_input = human_input&.map do |o|
          o["text"]
        end&.join(" ")

        messages = previous << { role: "user", content: human_input }

        # prompt = "#{start_log}\nHuman: #{human_input}\nAI:"

        Rails.logger.info "PROMPT: #{messages}"
        # data = prompt_settings(prompt)

        gpt_result = get_gpt_response(gpt_channel.data["prompt"], messages)

        text = gpt_result["choices"].first["message"]["content"]
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
          message_id: gpt_result[:id]
        )
      end
    end

    def prompt_settings(prompt)
      {
        prompt: prompt,
        stop: ["\n", "\nHuman:", "\nAI:"],
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        best_of: 1,
        max_tokens: 150
        # frequency_penalty: 0
        # length: 150
        # presence_penalty: 0.6
        # temperature: 0.9
        # top_p: 1
      }
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
          provider: "open_ai",
          message_source_id: message_id,
          check_assignment_rules: true
        )
      end
    end

    def post_data(url, data)
      authorize!
      @conn.post do |req|
        req.url url
        req.headers["Content-Type"] = "application/json; charset=utf-8"
        req.body = data.to_json
      end
    end

    def get_gpt_response(prompt, data)
      system_prompt = { role: "system", content: prompt }
      messages = []
      messages << system_prompt
      messages << data

      message_data = {
        model: "gpt-3.5-turbo",
        messages: messages.flatten
      }

      Rails.logger.debug message_data

      JSON.parse(post_data(@url, message_data).body)
    end

    def process_event(params, package)
      # todo, here we can do so many things like make a pause and
      # analize conversation subject or classyficators
    end

    # for display in replied message
    def self.display_data(data); end
  end
end
