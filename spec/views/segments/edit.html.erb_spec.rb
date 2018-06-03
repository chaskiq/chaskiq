require 'rails_helper'

RSpec.describe "segments/edit", type: :view do
  before(:each) do
    @segment = assign(:segment, Segment.create!())
  end

  it "renders the edit segment form" do
    render

    assert_select "form[action=?][method=?]", segment_path(@segment), "post" do
    end
  end
end
