require 'rails_helper'

RSpec.describe "campaigns/index", type: :view do
  before(:each) do
    assign(:campaigns, [
      Campaign.create!(
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
      ),
      Campaign.create!(
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
      )
    ])
  end

  it "renders a list of campaigns" do
    render
    assert_select "tr>td", :text => "From Name".to_s, :count => 2
    assert_select "tr>td", :text => "From Email".to_s, :count => 2
    assert_select "tr>td", :text => "Reply Email".to_s, :count => 2
    assert_select "tr>td", :text => "Html Content".to_s, :count => 2
    assert_select "tr>td", :text => "Serialized Content".to_s, :count => 2
    assert_select "tr>td", :text => "Description".to_s, :count => 2
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => "Timezone".to_s, :count => 2
    assert_select "tr>td", :text => "".to_s, :count => 2
    assert_select "tr>td", :text => nil.to_s, :count => 2
    assert_select "tr>td", :text => "".to_s, :count => 2
  end
end
