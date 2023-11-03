# frozen_string_literal: true

require "rails_helper"

describe ListRenderer::Component do
  let(:title_1) { "Foo" }
  let(:title_2) { "Bar" }
  let(:options) do
    {
      field: [
        {
          "image" => "https://example.com/image.png",
          "title" => title_1
        },
        {
          "title" => title_2
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
    expect(page).to have_text(title_1)
    expect(page).to have_text(title_2)
  end
end
