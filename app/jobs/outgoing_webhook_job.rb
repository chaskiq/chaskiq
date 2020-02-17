# frozen_string_literal: true

class OutgoingWebhookJob < ActiveJob::Base
  queue_as :default

  def perform(event_id:)
    event = Event.find(event_id)
    app = event.eventable.app
    
    payload = {
      action: event.action,
      created_at: event.created_at,
      data: {
        subject: event.eventable.as_json,
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
end