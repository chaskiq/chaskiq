# frozen_string_literal: true

class MailImporterJob < ApplicationJob
  queue_as :default

  def perform(*_args)
    # send to all list with state passive & subscribed
    campaign.apply_premailer
    campaign.list.subscriptions.availables.each do |s|
      campaign.push_notification(s)
    end
  end
end
