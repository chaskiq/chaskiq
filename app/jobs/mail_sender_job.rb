# frozen_string_literal: true

class MailSenderJob < ActiveJob::Base
  queue_as :default

  # send to all list with state passive & subscribed
  def perform(campaign)
    campaign.apply_premailer
    campaign
      .available_segments
      .where.not(email: nil).each do |app_user|
      campaign.push_notification(app_user)
    end

    campaign.state = 'sent'
    campaign.save
  end
end
