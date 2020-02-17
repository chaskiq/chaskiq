# frozen_string_literal: true

# plan

# give bot agents super powers
# assign one dialog flow integration for agents
# tbd

require 'google/cloud/dialogflow'

module MessageApis
  class Dialogflow
    attr_accessor :key, :secret

    def initialize(config:)
      credentials = JSON.parse(config['credentials']) 
      @project_id = config["project_id"]
      @conn = Google::Cloud::Dialogflow::Sessions.new(
        credentials: credentials
      )
    end

    def send_text(text:, session_id:, lang: 'en-US')      
      @session = @conn.class.session_path @project_id, session_id
      # texts = "I need a bot for android"
      get_intent_for(text, lang)
    end

    def get_intent_for(text, lang)
      query_input = {
        text: {
          text: text,
          language_code: lang
        }
      }
      response = @conn.detect_intent @session, query_input
      query_result = response.query_result

      puts "Query text:        #{query_result.query_text}"
      puts "Intent detected:   #{query_result.intent.display_name}"
      puts "Intent confidence: #{query_result.intent_detection_confidence}"
      puts "Fulfillment text:  #{query_result.fulfillment_text}\n"
      puts '-------------------'
      if query_result.intent_detection_confidence > 0.7
        query_result.fulfillment_text
      end
    end

    def self.tester(text: 'I need a bot for android')
      key_file   = Rails.application.credentials.integrations.dig(:dialogflow, :key_file)
      project_id = Rails.application.credentials.integrations.dig(:dialogflow, :project_id)

      json_credentials = JSON.parse(open(key_file).readlines.join)
      # project_id = "faq-fhmkon"

      a = MessageApis::Dialogflow.new(
        credentials: json_credentials,
        project_id: project_id
      )

      a.send_text(
        text: text,
        session_id: '1234'
      )
    end
  end
end
