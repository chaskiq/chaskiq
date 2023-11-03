# frozen_string_literal: true

require "rails_helper"

describe PageHeader::Component do
  let(:title) { "This is a title" }
  let(:options) do
    {
      title: title
    }
  end
  let(:component) { PageHeader::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(title)
  end
end
