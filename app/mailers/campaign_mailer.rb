class CampaignMailer < ApplicationMailer


  layout 'mailer'
  #default delivery_method: :ses

  def newsletter(campaign, subscriber)
    # subscriber = subscription.user

    return if subscriber.blank?

    content_type  = "text/html"

    attrs = subscriber.attributes

    @campaign = campaign

    @subscriber = subscriber

    @body = campaign.compiled_template_for(subscriber).html_safe

    mail( from: "#{campaign.from_name}<#{campaign.from_email}>",
          to: subscriber.email,
          subject: campaign.subject,
          content_type: content_type,
          return_path: campaign.reply_email )
  end

  def test(campaign)

    content_type  = "text/html"

    @campaign = campaign

    @subscriber = {
      name: "Test Name", 
      last_name: "Test Last Name", 
      email: "test@test.com"
    }

    @body = campaign.compiled_template_for(@subscriber).html_safe

    content_type  = "text/html"

    mail( from: "#{campaign.from_name}<#{campaign.from_email}>",
          to: "miguelmichelson@gmail.com",
          subject: campaign.subject,
          body: campaign.reply_email,
          content_type: content_type ) do |format|
      format.html { render 'newsletter' }
    end
  end


end
