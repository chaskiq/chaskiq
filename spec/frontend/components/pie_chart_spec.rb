# frozen_string_literal: true

require "rails_helper"

describe PieChart::Component do
  let(:label) { "label-chart" }
  let(:options) do
    {
      data: [1, 2, 3],
      label: label
    }
  end
  let(:component) { PieChart::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(label.underscore.humanize)
  end
end
