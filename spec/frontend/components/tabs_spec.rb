# frozen_string_literal: true

require "rails_helper"

describe Tabs::Component do
  let(:label1) { "item 1" }
  let(:label2) { "item 2" }
  let(:options) do
    {
      items: [
        {
          href: "https://example.com",
          label: label1
        },
        {
          href: "https://www.google.com",
          label: label2
        }
      ]
    }
  end
  let(:component) { Tabs::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_css("a", count: 2)
    expect(page).to have_text(label1)
    expect(page).to have_text(label2)
    expect(page).to have_css("span", count: 2)
  end
end
