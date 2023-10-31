# frozen_string_literal: true

require "rails_helper"

describe UpgradeButton::Component do
  let(:options) { {
    plan: Plan.all.first
  } }
  let(:component) { UpgradeButton::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
