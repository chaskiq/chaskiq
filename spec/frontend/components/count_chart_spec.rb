# frozen_string_literal: true

require "rails_helper"

describe CountChart::Component do
  let(:options) do
    {
      data: "foo",
      label: "boo",
      append_label: "bar",
      subtitle: "foo sub"
    }
  end
  let(:component) { CountChart::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("p", count: 3)
  end
end
