# frozen_string_literal: true

require "rails_helper"

describe HeatMapChart::Component do
  let(:from) { "foo" }
  let(:to) { "bar" }
  let(:data) { "data" }
  let(:options) do
    {
      data: data,
      from: from,
      to: to
    }
  end
  let(:component) { HeatMapChart::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end

  it "set the data attributes" do
    render_inline(component)

    div = page.find_css("div").first

    expect(div["data-points"]).to eq(data)
    expect(div["data-from"]).to eq(from)
    expect(div["data-to"]).to eq(to)
  end
end
