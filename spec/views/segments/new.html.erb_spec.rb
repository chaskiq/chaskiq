require 'rails_helper'

RSpec.describe "segments/new", type: :view do
  before(:each) do
    assign(:segment, Segment.new())
  end

  it "renders new segment form" do
    render

    assert_select "form[action=?][method=?]", segments_path, "post" do
    end
  end
end
