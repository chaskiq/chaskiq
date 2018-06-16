require 'rails_helper'

RSpec.describe "campaigns/edit", type: :view do
  before(:each) do
    @campaign = assign(:campaign, Campaign.create!(
      :from_name => "MyString",
      :from_email => "MyString",
      :reply_email => "MyString",
      :html_content => "MyString",
      :serialized_content => "MyString",
      :description => "MyString",
      :name => "MyString",
      :timezone => "MyString",
      :state => "",
      :app => nil,
      :segments => ""
    ))
  end

  it "renders the edit campaign form" do
    render

    assert_select "form[action=?][method=?]", campaign_path(@campaign), "post" do

      assert_select "input[name=?]", "campaign[from_name]"

      assert_select "input[name=?]", "campaign[from_email]"

      assert_select "input[name=?]", "campaign[reply_email]"

      assert_select "input[name=?]", "campaign[html_content]"

      assert_select "input[name=?]", "campaign[serialized_content]"

      assert_select "input[name=?]", "campaign[description]"

      assert_select "input[name=?]", "campaign[name]"

      assert_select "input[name=?]", "campaign[timezone]"

      assert_select "input[name=?]", "campaign[state]"

      assert_select "input[name=?]", "campaign[app_id]"

      assert_select "input[name=?]", "campaign[segments]"
    end
  end
end
