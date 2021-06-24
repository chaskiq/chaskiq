# frozen_string_literal: true

class CampaignMailer < ApplicationMailer
  layout "mailer"
  # default delivery_method: :ses

  def newsletter(campaign, subscriber)
    return if subscriber.blank?

    content_type = "text/html"

    headers "X-SES-CONFIGURATION-SET" => ENV["SNS_CONFIGURATION_SET"]
    headers "X-CHASKIQ-CAMPAIGN-ID" => campaign.id
    headers "X-CHASKIQ-CAMPAIGN-TO" => subscriber.id

    attrs = subscriber.attributes

    @campaign = campaign

    @subscriber = subscriber

    @body = campaign.compiled_template_for(subscriber).html_safe

    mail(
         from: "#{campaign.from_name}<#{campaign.campaign_outgoing_email}>",
         to: subscriber.email,
         subject: campaign.subject,
         content_type: content_type
        )
  end

  def test(campaign)
    content_type = "text/html"

    @campaign = campaign

    @subscriber = {
      name: "Test Name",
      last_name: "Test Last Name",
      email: "test@test.com"
    }

    @body = campaign.compiled_template_for(@subscriber).html_safe

    content_type = "text/html"

    mail(from: "#{campaign.from_name}<#{campaign.from_email}>",
         to: ENV["ADMIN_EMAIL"],
         subject: campaign.subject,
         body: campaign.reply_email,
         content_type: content_type) do |format|
      format.html { render "newsletter" }
    end
  end
end
