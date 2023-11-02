# frozen_string_literal: true

require "rails_helper"

describe DataTableRenderer::Component do
  let(:options) do
    {
      id: "foo",
      size: 2,
      items: [
        {
          field: "field_1",
          value: "value_1"
        },
        {
          field: "field_2",
          value: "value_2"
        }
      ]
    }
  end
  let(:component) { DataTableRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("dl.data-table")
    expect(page).to have_css("dt", count: 2)
    expect(page).to have_css("dd", count: 2)
  end
end
