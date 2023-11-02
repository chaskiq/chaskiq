# frozen_string_literal: true

require "rails_helper"

describe ListRenderer::Component do
  let(:options) { {} }
  let(:component) { ListRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end