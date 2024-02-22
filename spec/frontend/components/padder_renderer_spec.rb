# frozen_string_literal: true

require "rails_helper"

describe PadderRenderer::Component do
  let(:options) { { size: 1 } }
  let(:component) { PadderRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
