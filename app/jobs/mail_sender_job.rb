class MailSenderJob < ActiveJob::Base

  queue_as :default

  #send to all list with state passive & subscribed
  def perform(campaign)
    campaign.apply_premailer
    campaign.available_segments.each do |app_user|
      campaign.push_notification(app_user)
    end
  end
end
