# frozen_string_literal: true

require "rails_helper"

describe EmptyView::Component do
  let(:options) { {
    subtitle: "foo",
    title: "title",
    text: "text"
  } }
  let(:component) { EmptyView::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
