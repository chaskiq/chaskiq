# frozen_string_literal: true

require "rails_helper"

describe ButtonRenderer::Component do
  let(:options) do
    {
      id: "oli",
      label: "aaa"
    }
  end
  let(:component) { ButtonRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    # is_expected.to have_css "div"
  end
end
