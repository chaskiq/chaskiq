# frozen_string_literal: true

module MessageApis
  class OpenAi < BasePackage
    include MessageApis::Helpers

    BASE_URL = 'https://api.openai.com/v1'
    PROVIDER = 'openai'

    attr_accessor :url, :api_secret, :conn

    def initialize(config:)
      @api_secret = config['api_secret']

      @url = "#{BASE_URL}/engines/davinci/completions"

      @conn = Faraday.new(
        request: {
          params_encoder: Faraday::FlatParamsEncoder
        }
      )
      self
    end

    def authorize!
      @conn.authorization :Bearer, @api_secret
    end

    def trigger(event)
      subject = event.eventable
      action = event.action

      puts "EVENTTTT: #{action}"

      case action
      # when "visitors.convert" then notify_new_lead(subject)
      when 'conversation.user.first.comment' then notify_added(subject)
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
                                                     provider: 'open_ai',
                                                     provider_channel_id: conversation.id
                                                   }).destroy

        # assign and return , bot conversation over
        # conversation.assign_user(part.authorable)
        return true
      end
    end

    def notify_message(conversation:, part:, channel:)
      return if conversation.conversation_channels.blank?
      return unless part.messageable.is_a?(ConversationPartContent)
      return true if locked_for_channel?(conversation, part)
      return if part.conversation_part_channel_sources.where(provider: 'open_ai').any?

      puts "ENTRA #{part.id}"

      unless part.authorable.is_a?(Agent)
        #####
        ## cache this
        messages = conversation.messages.where(
          messageable_type: 'ConversationPartContent'
        ).where.not(id: part.id).order('id')
        #####

        # conversation.conversation_channels.find_by(provider_channel_id: channel)
        # cache this thing:
        previous = messages.map do |m|
          {
            text: m.message.text_from_serialized,
            from: m.authorable_type
          }
        end.map  do |part|
          "#{part[:from] == 'Agent' ? "\nAI:" : "\nHuman:"}#{part[:text]}"
        end.join("\n")

        start_log = "'''The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.
Human: Hello, who are you?
AI: I am an AI created by OpenAI. How can I help you today?
#{previous}
Human:'''"

        human_input = part.message&.parsed_content['blocks'].map { |o| 
          o['text'] 
        }.join(' ')

        prompt = "#{start_log}\nHuman: #{human_input}\nAI:"

        puts "PROMPT: #{prompt}"
        data = prompt_settings(prompt)

        gpt_result = get_gpt_response(data)

        text = gpt_result.dig(:text)
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

    def add_message(conversation: , from: , text: , blocks:, message_id:)
      # TODO: serialize message
      conversation.transaction do
        conversation.add_message(
          from: from,
          message: {
            html_content: text,
            serialized_content: blocks
          },
          provider: 'open_ai',
          message_source_id: message_id,
          check_assignment_rules: true
        )
      end
    end

    def post_data(url, data)
      authorize!
      @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end
    end

    def get_gpt_response(data)
      response = post_data(@url, data)

      return nil unless response.success?

      if json_body = JSON.parse(response.body)
        json_body
        puts "GOT RESPONSE FROM GPT-3: #{json_body}"
      end

      text = json_body['choices'].map { |o| o['text'] }.join(' ')
      { text: text, id: json_body['id'] }
    end

    def process_event(params, package)
      # todo, here we can do so many things like make a pause and
      # analize conversation subject or classyficators
    end

    # for display in replied message
    def self.display_data(data)
    end

    class PromptRecord
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :prompt

      def initialize(prompt:)
        self.prompt = prompt
      end

      def default_schema
        [
          { type: 'text', text: 'GPT-3 Chatbot', style: 'header' },
          { type: 'text', text: 'This is a GPT-3 for Chatbots', style: 'muted' },
          { type: 'textarea',
            id: 'prompt',
            name: 'prompt',
            label: 'Prompt data',
            placeholder: 'Enter text here...',
            value: prompt,
            errors: errors[:prompt]&.uniq&.join(', ') },
          {
            type: 'button',
            id: 'add-prompt',
            variant: 'outlined',
            size: 'small',
            label: 'save prompt',
            action: {
              type: 'submit'
            }
          }
        ]
      end

      def error_schema
        [
          { type: 'text', text: 'This is a header', style: 'header' },
          { type: 'text', text: 'This is a header', style: 'muted' },
          { type: 'textarea',
            id: 'textarea-3',
            name: 'textarea-3',
            label: 'Error',
            placeholder: 'Enter text here...',
            value: send(:prompt),
            errors: errors[:prompt]&.uniq&.join(', ') },
          {
            type: 'button',
            id: 'add-prompt',
            variant: 'outlined',
            size: 'small',
            label: 'save prompt',
            action: {
              type: 'submit'
            }
          }
        ]
      end

      def schema
        [
          { type: 'text', text: 'This is a header', style: 'header' },
          { type: 'text', text: 'This is a header', style: 'muted' }
        ]
      end

      def success_schema
        [
          { type: 'text', text: 'Open AI conversation', style: 'header' },
          { type: 'text', text: 'you are going to start a conversation with GPT-3 bot', style: 'muted' },
          {
            type: 'button',
            id: 'prompt-ok',
            variant: 'success',
            align: 'center',
            size: 'medium',
            label: 'Start chat',
            action: {
              type: 'submit'
            }
          },
          {
            type: 'button',
            id: 'prompt-no',
            variant: 'link',
            size: 'medium',
            align: 'center',
            label: 'Cancel',
            action: {
              type: 'submit'
            }
          }
        ]
      end
    end
  end
end
