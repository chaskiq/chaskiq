class SesSenderJob < ApplicationJob
  queue_as :mailers

  #send to ses
  def perform(campaign, subscription)
    subscriber = subscription.subscriber

    return if subscriber.blank?

    mailer     = campaign.prepare_mail_to(subscription)
    response   = mailer.deliver

    message_id = response.message_id.gsub("@email.amazonses.com", "")

    campaign.metrics.create(
      trackable: subscription,
      action: "deliver",
      data: message_id)

  end
end
