# frozen_string_literal: true

require "rails_helper"

describe EmptyView::Component do
  let(:title) { "This is a title" }
  let(:subtitle) { "Subtitle" }
  let(:options) do
    {
      subtitle: subtitle,
      title: title
    }
  end
  let(:component) { EmptyView::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")

    expect(page).to have_text(title)
    expect(page).to have_text(subtitle)
  end
end
