# frozen_string_literal: true

require "rails_helper"

describe Dropdown::Component do
  let(:options) do
    {
      label: "foo"
    }
  end
  let(:component) { Dropdown::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
    expect(page).to have_text(options[:label])
  end
end
