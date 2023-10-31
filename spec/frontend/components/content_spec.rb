# frozen_string_literal: true

require "rails_helper"

describe Content::Component do
  let(:options) do
    {
      data: "",
      label: ""
    }
  end
  let(:component) { Content::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
