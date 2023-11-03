# frozen_string_literal: true

require "rails_helper"

describe ImageRenderer::Component do
  let(:url) { "https://examle.com/image.png" }
  let(:options) { { url: url } }
  let(:component) { ImageRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div.image")

    image = page.find_css("img").first
    expect(image["src"]).to eq(url)
  end
end
