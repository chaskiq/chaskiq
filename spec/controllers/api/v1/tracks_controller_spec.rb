require 'rails_helper'

RSpec.describe Api::V1::TracksController, type: :controller do

  let(:list){ FactoryBot.create(:chaskiq_list) }
  let(:subscriber){
    list.create_subscriber FactoryBot.attributes_for(:chaskiq_subscriber)
  }
  let(:campaign){ FactoryBot.create(:chaskiq_campaign, list: list) }

  %w[open bounce spam].each do |action|
    it "will track an #{action}" do
      campaign
      response = get(action , params: {campaign_id: campaign.id, id: subscriber.encoded_id})
      expect(response.status).to be == 200
      expect(campaign.metrics.send(action.pluralize).size).to be == 1
      expect(response.content_type).to be == "image/gif"
    end
  end

  it "will track a click and redirect" do
    campaign
    response = get("click" , params: {campaign_id: campaign.id, id: subscriber.encoded_id, r: "http://google.com"})
    expect(response.status).to be == 302
    expect(campaign.metrics.clicks.size).to be == 1
    expect(response).to redirect_to "http://google.com"
  end

end
