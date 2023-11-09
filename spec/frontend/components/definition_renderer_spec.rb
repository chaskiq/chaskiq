# frozen_string_literal: true

require "rails_helper"

describe DefinitionRenderer::Component do
  let(:location) { "New York" }
  let(:text) { "this is a text" }
  let(:options) do
    {
      schema: [
        {
          type: "text",
          text: text,
          align: "left",
          style: "paragraph"
        }
      ],
      size: 1,
      location: location,
      blocks: {
        kind: "bar"
      }
    }.with_indifferent_access
  end
  let(:component) { DefinitionRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")

    location_input = page.find_css('input[type="hidden"][name="message[location]"]').first
    expect(location_input["value"]).to eq(location)

    expect(page).to have_text(text)
  end
end
