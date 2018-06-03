require 'rails_helper'

RSpec.describe "segments/show", type: :view do
  before(:each) do
    @segment = assign(:segment, Segment.create!())
  end

  it "renders attributes in <p>" do
    render
  end
end
