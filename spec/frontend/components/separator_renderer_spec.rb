# frozen_string_literal: true

require "rails_helper"

describe SeparatorRenderer::Component do
  let(:options) { {} }
  let(:component) { SeparatorRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
