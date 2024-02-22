# frozen_string_literal: true

require "rails_helper"

describe Table::Component do
  let(:options) do
    {
      data: [],
      config: {
        columns: []
      }
    }
  end
  let(:component) { Table::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
