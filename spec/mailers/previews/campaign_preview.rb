# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/campaign
class CampaignPreview < ActionMailer::Preview

  def campaign_email
    campaign = Campaign.last
    subscriber = AppUser.find(2)
    campaign.apply_premailer
    CampaignMailer.newsletter(campaign, subscriber)
  end

end
