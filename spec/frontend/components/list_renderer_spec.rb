# frozen_string_literal: true

require "rails_helper"

describe ListRenderer::Component do
  let(:title1) { "Foo" }
  let(:title2) { "Bar" }
  let(:options) do
    {
      field: [
        {
          "image" => "https://example.com/image.png",
          "title" => title1
        },
        {
          "title" => title2
        }
      ]
    }
  end
  let(:component) { ListRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div.list-wrapper")
    expect(page).to have_css("img", count: 1)
    expect(page).to have_text(title1)
    expect(page).to have_text(title2)
  end
end
