# frozen_string_literal: true

module MessageApis
  class OpenAi	
    
    include MessageApis::Helpers

		BASE_URL = 'https://api.openai.com/v1'
    PROVIDER = 'openai'
    
		attr_accessor :url, :api_secret, :conn

    def initialize(config:)

      @api_secret = config["api_secret"]

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
      #when "visitors.convert" then notify_new_lead(subject)
      when "conversation.user.first.comment" then notify_added(subject)
      #when "conversations.added" then notify_added(subject)
      else
      end
		end
		
		def notify_added(conversation)
			authorize!

      message = conversation.messages.where.not(
        authorable_type: "Agent"
      ).last
      
      participant = conversation.main_participant

      conversation.conversation_channels.create({
        provider: 'open_ai',
        provider_channel_id: conversation.id
      })
    end
    
    def notify_message(conversation: , part:, channel:)
      if !part.authorable.is_a?(Agent)

        # cache this thing:
        previous = conversation.messages.map{|m| 
          { 
            text: m.message.text_from_serialized, 
            from: m.authorable_type 
          } 
        }.map{ |part|
          "#{ part[:from] == "Agent" ? "\nAI:" : "\nHuman:" }#{part[:text]}"
        }.join("\n")

        start_log = "'''The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.
Human: Hello, who are you?
AI: I am an AI created by OpenAI. How can I help you today?
#{previous}
Human:'''"

        human_input = part.message&.parsed_content["blocks"].map{|o| o["text"]}.join(" ")

        prompt = "#{start_log}\nHuman: #{human_input}\nAI:"
        data = {
          prompt: prompt, 
          stop: ["\n", "\nHuman:", "\nAI:"], 
          temperature: 0.9,
          top_p: 1, 
          frequency_penalty: 0,
          presence_penalty: 0.6, 
          best_of: 1,
          max_tokens: 150
          #frequency_penalty: 0
          #length: 150
          #presence_penalty: 0.6
          #temperature: 0.9
          #top_p: 1
        }
        response = post_data(@url, data)

        if response.success? && json_body = JSON.parse(response.body)
          json_body
          puts "GOT RESPONSE FROM GPT-3: #{json_body}"
        end

        text = json_body["choices"].map{|o| o["text"]}.join(" ")

        blocks = { 
          blocks: [
            serialized_block(text), 
          ].flatten.compact
        }.to_json

        # TODO: serialize message
        a = conversation.add_message(
          from: conversation.app.agents.first,
          message: {
            html_content: text,
            serialized_content: blocks
          },
          provider: 'open_ai',
          message_source_id: json_body['id'],
          check_assignment_rules: true
        )

      end
    end

    def post_data(url, data)
      authorize!
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json; charset=utf-8'
        req.body = data.to_json
      end
      response
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      binding.pry
    end

    # for display in replied message
    def self.display_data(data)
    end

    class PresenterManager
      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or 
      # the home screen, so that you can render the app.
      def self.initialize_hook(kind: , ctx:)
        {
          kind: kind, 
          #ctx: ctx, 
          definitions: record.schema 
        }
      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button, 
      # link, or text input. This flow can occur multiple times as an 
      # end-user interacts with your app.
      def self.submit_hook(kind:, ctx:)
        result
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show 
      # them configuration options before it’s inserted. Leaving this option 
      # blank will skip configuration.
      def self.configure_hook(kind: , ctx:)
        app = ctx[:app]
        fields = app.searcheable_fields

        return {
          #kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }
      end

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(params)
        []
      end
    end
  end
end
