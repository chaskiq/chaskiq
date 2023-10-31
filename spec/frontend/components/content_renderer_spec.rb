# frozen_string_literal: true

require "rails_helper"

describe ContentRenderer::Component do
  let(:options) { 
    {
      id: "",
      values: "",
      path: ""
    } 
  }
  let(:component) { ContentRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
