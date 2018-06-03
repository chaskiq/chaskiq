require 'rails_helper'

RSpec.describe "segments/index", type: :view do
  before(:each) do
    assign(:segments, [
      Segment.create!(),
      Segment.create!()
    ])
  end

  it "renders a list of segments" do
    render
  end
end
