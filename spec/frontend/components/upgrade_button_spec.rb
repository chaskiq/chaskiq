# frozen_string_literal: true

require "rails_helper"

describe UpgradeButton::Component do
  let(:app) { FactoryBot.create(:app) }
  let(:feature) { "Articles" }
  let(:options) do
    {
      app: app,
      feature: feature,
      label: "label text"
    }
  end
  let(:component) { UpgradeButton::Component.new(**options) }

  subject { rendered_component }

  context "when SUBSCRIPTIONS_ENABLED is true" do
    before do
      stub_const('ENV', 'SUBSCRIPTIONS_ENABLED' => "true")
    end

    context "and app allows feature" do
      it "renders" do
        render_inline(component)
        expect(page).to have_css("div")
        binding.pry
        expect(page).to have_text(I18n.t("subscriptions.features.#{feature}.upgrade_message"))
      end
    end

    context "and app does not allow feature" do
      let(:feature) { "" }

      it "renders empty" do
        render_inline(component)
        expect(page).to have_content('')
      end
    end
  end

  context "when SUBSCRIPTIONS_ENABLED is false" do
    before do
      stub_const('ENV', 'SUBSCRIPTIONS_ENABLED' => "false")
    end

    it "renders empty" do
      render_inline(component)
      expect(page).to have_content('')
    end
  end
end
