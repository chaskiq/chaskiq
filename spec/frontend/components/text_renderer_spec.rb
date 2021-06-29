# frozen_string_literal: true

require "rails_helper"

describe TextRenderer::Component do
  let(:options) { {} }
  let(:component) { TextRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    is_expected.to have_css "div"
  end
end