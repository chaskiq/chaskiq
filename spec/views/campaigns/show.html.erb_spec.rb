require 'rails_helper'

RSpec.describe "campaigns/show", type: :view do
  before(:each) do
    @campaign = assign(:campaign, Campaign.create!(
      :from_name => "From Name",
      :from_email => "From Email",
      :reply_email => "Reply Email",
      :html_content => "Html Content",
      :serialized_content => "Serialized Content",
      :description => "Description",
      :name => "Name",
      :timezone => "Timezone",
      :state => "",
      :app => nil,
      :segments => ""
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/From Name/)
    expect(rendered).to match(/From Email/)
    expect(rendered).to match(/Reply Email/)
    expect(rendered).to match(/Html Content/)
    expect(rendered).to match(/Serialized Content/)
    expect(rendered).to match(/Description/)
    expect(rendered).to match(/Name/)
    expect(rendered).to match(/Timezone/)
    expect(rendered).to match(//)
    expect(rendered).to match(//)
    expect(rendered).to match(//)
  end
end
