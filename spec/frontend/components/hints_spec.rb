# frozen_string_literal: true

require "rails_helper"

describe Hints::Component do
  let(:type) { "platform" }
  let(:options) do
    {
      type: type
    }
  end
  let(:component) { Hints::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(I18n.t("hints.#{type}.title"))
    expect(page).to have_text(I18n.t("hints.#{type}.description"))
  end
end
