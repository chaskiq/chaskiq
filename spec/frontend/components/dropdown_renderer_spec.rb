# frozen_string_literal: true

require "rails_helper"

describe DropdownRenderer::Component do
  let(:options) { {} }
  let(:component) { DropdownRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
