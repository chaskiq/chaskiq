# frozen_string_literal: true

class OutgoingWebhookJob < ApplicationJob
  queue_as :default

  def perform(event_id:)
    event = Event.find(event_id)
    app = event.eventable.app

    payload = {
      action: event.action,
      created_at: event.created_at,
      data: {
        subject: subject_data(event.eventable),
        properties: event.properties
      }
    }

    app.outgoing_webhooks
       .tagged_with(event.action)
       .where(state: "enabled").each do |webhook|
      OutgoingWebhookDispatcherJob.perform_later(
        webhook_id: webhook.id,
        payload: payload
      )
    end
  end

  def subject_data(eventable)
    case eventable.class
    when Conversation
      eventable.as_json(methods: %i[main_participant assignee latest_message]).to_json
    else
      eventable.to_json
    end
  end
end
