
require 'google/cloud/dialogflow'

module MessageApis
  class Dialogflow

    def initialize(config:)
      credentials = JSON.parse(config['credentials']) 
      @project_id = config["project_id"]
      @conn = Google::Cloud::Dialogflow::sessions do |config|
        config.credentials = credentials
      end
    end

    def create_hook_from_params(params, package)

    end

    def process_event(params, package)

    end

    def notify_message(conversation:, part:, channel:)
      return if conversation.assignee.present? || part.authorable_type != "AppUser"

      part.read!

      message = part.message.as_json

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      text = blocks.map{|o| 
        o["text"]
      }.join("\r\n")

      response_text = get_intent_for(text: text, session_id: conversation.id)

      return if response_text.empty?

      conversation.add_message(
        from: conversation.app.agents.first,
        message: {
          html_content: response_text
        },
        provider: 'dialogflow'
      )
    end

    def get_intent_for(text:, session_id:, lang: 'en-US')
      query_input = {
        text: {
          text: text,
          language_code: lang
        }
      }

      request = Google::Cloud::Dialogflow::V2::DetectIntentRequest.new(
        session: "projects/#{@project_id}/agent/sessions/#{session_id}",
        query_input: query_input
      )

      response = @conn.detect_intent request

      query_result = response.query_result

      puts "Query text:        #{query_result.query_text}"
      puts "Intent detected:   #{query_result.intent.display_name}"
      puts "Intent confidence: #{query_result.intent_detection_confidence}"
      puts "Fulfillment text:  #{query_result.fulfillment_text}"
      puts "Required params present:  #{query_result.all_required_params_present}" 

      query_result.fulfillment_text
    end
  end
end
