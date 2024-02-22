# frozen_string_literal: true

require "rails_helper"

describe SpacerRenderer::Component do
  let(:options) { { size: 1 } }
  let(:component) { SpacerRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
