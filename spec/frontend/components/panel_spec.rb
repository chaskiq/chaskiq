# frozen_string_literal: true

require "rails_helper"

describe Panel::Component do
  let(:title) { "This is a title" }
  let(:text) { "This is a text" }

  let(:options) do
    {
      title: title,
      text: text,
      link: {
        href: "https://example.com",
        text: "foo"
      },
      classes: "hidden"
    }
  end
  let(:component) { Panel::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(title)
    expect(page).to have_text(text)
    expect(page).to have_css("a")
  end
end
