# frozen_string_literal: true

class SesSenderJob < ApplicationJob
  queue_as :mailers

  # send to ses
  def perform(campaign, subscription)
    return if subscription.blank? || subscription.unsubscribed?
    mailer     = campaign.prepare_mail_to(subscription)
    response   = mailer.deliver_now
  end
end
