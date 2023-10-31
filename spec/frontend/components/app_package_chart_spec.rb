# frozen_string_literal: true

require "rails_helper"

describe AppPackageChart::Component do
  let(:options) { {
    data: {},
    name: "",
    icon: ""
  } }
  let(:component) { AppPackageChart::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    # is_expected.to have_css "div"
    expect(page).to have_css("div")
  end
end
