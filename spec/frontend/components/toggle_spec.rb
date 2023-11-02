# frozen_string_literal: true

require "rails_helper"

describe Toggle::Component do
  let(:checked) { true }
  let(:options) do
    {
      id: "id",
      url: "https://example.com",
      label: "blue label",
      checked: checked,
      disabled: false,
      on_change: "onchange"
    }
  end
  let(:component) { Toggle::Component.new(**options) }

  subject { rendered_component }

  it "renders a checked input" do
    render_inline(component)

    expect(page.find("input##{options[:id]}")).to be_checked
  end

  context "when checked is false" do
    let(:checked) { false }

    it "renders an unchecked input" do
      render_inline(component)

      expect(page.find("input##{options[:id]}")).not_to be_checked
    end
  end
end
