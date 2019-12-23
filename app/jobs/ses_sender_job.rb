# frozen_string_literal: true

class SesSenderJob < ApplicationJob
  queue_as :mailers

  # send to ses
  def perform(campaign, subscription)
    return if subscription.blank? || subscription.unsubscribed?

    mailer     = campaign.prepare_mail_to(subscription)
    response   = mailer.deliver_now

    message_id = response.message_id.split('@').first

    campaign.metrics.create(
      trackable: subscription,
      action: 'send',
      message_id: message_id
    )
  end
end
