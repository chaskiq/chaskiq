class OutgoingWebhookDispatcherJob < ActiveJob::Base
  queue_as :default

  #sidekiq_options retry: 5

  def perform(webhook_id:, payload:)
    webhook = OutgoingWebhook.find(webhook_id)
    response = webhook.send_notification(data: payload)
    raise "webhook response wasn't 200 got: #{response}" if response != 200
  end
end