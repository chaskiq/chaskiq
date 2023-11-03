# frozen_string_literal: true

require "rails_helper"

describe TextRenderer::Component do
  let(:text){ "foo" }
  let(:options) { { text: text } }
  let(:component) { TextRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("p")
    expect(page).to have_text(text)
  end
end
