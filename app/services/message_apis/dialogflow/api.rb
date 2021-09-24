# frozen_string_literal: true

# plan

# give bot agents super powers
# assign one dialog flow integration for agents
# tbd

# require "google/cloud/dialogflow"
require "google/cloud/dialogflow/v2"

module MessageApis::Dialogflow
  class Api < MessageApis::BasePackage
    include MessageApis::Helpers

    PROVIDER = "dialogflow"

    attr_accessor :key, :secret

    def initialize(config:)
      credentials = JSON.parse(config["credentials"])
      @project_id = config["project_id"]
      @conn = Google::Cloud::Dialogflow.sessions do |c|
        c.credentials = credentials
      end
    end

    def validate_integration
      get_response_for(text: "hi", session_id: "test", lang: "en-US")
      nil
    rescue StandardError => e
      [e.class.to_s]
    end

    def trigger(event)
      subject = event.eventable
      action = event.action
      case action
      when "conversations.added", "conversation.user.first.comment" then notify_added(subject)
      end
    end

    def notify_added(conversation)
      participant = conversation.main_participant

      # should identify something from dialogflow here ?

      conversation.conversation_channels.find_or_create_by({
                                                             provider: "dialogflow",
                                                             provider_channel_id: conversation.id
                                                           })
    end

    def notify_message(conversation:, part:, channel:)
      # return if conversation.assignee.present? ||
      return if conversation.assignee.blank? || !conversation.assignee.bot?
      return if part.authorable_type != "AppUser"

      part.read!

      message = part.message.as_json

      blocks = JSON.parse(
        message["serialized_content"]
      )["blocks"]

      text = blocks.map do |o|
        o["text"]
      end.join("\r\n")

      response_text = get_response_for(text: text, session_id: conversation.id)

      return if response_text.empty?

      serialized_text = text_block(response_text)

      conversation.add_message(
        from: conversation.app.agents.bots.first,
        message: {
          html_content: response_text,
          serialized_content: serialized_text
        },
        provider: "dialogflow"
      )
    end

    def get_response_for(text:, session_id:, lang: "en-US")
      query_input = {
        text: {
          text: text,
          language_code: lang
        }
      }

      # query_parameters =
      # payload: {
      #  email: "aa@aa.cl"
      # }
      # session_entity_types: [
      # Google::Cloud::Dialogflow::V2::SessionEntityType.new(
      #  name: "email",
      #  entities: [
      #    Google::Cloud::Dialogflow::V2::EntityType::Entity.new(
      #      value: "aa@aaaa.cl",
      #      #synonyms: ["@sys.email"]
      #    )
      #  ]
      # )
      # ]
      # }

      query_parameters = Google::Cloud::Dialogflow::V2::QueryParameters.new

      # query_parameters.contexts << Google::Cloud::Dialogflow::V2::Context.new(
      #  name: "Lead",
      #  lifespan_count: 1
      # )

      request = Google::Cloud::Dialogflow::V2::DetectIntentRequest.new(
        session: "projects/#{@project_id}/agent/sessions/#{session_id}",
        query_input: query_input,
        query_params: query_parameters
      )

      response = @conn.detect_intent request

      query_result = response.query_result

      Rails.logger.info("Query text:        #{query_result.query_text}")
      Rails.logger.info("Intent detected:   #{query_result.intent.display_name}")
      Rails.logger.info("Intent confidence: #{query_result.intent_detection_confidence}")
      Rails.logger.info("Fulfillment text:  #{query_result.fulfillment_text}")

      query_result.fulfillment_text
    end

    def create_hook_from_params(params, package); end

    def process_event(params, package); end
  end
end
