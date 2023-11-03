# frozen_string_literal: true

require "rails_helper"

describe FilterMenu::Component do
  let(:title) { "This is a title" }
  let(:description) { "This is a description"}
  let(:label) { "foo" }
  let(:options) do
    {
      items: [
        {
          href: "https://example.com",
          data: "value",
          state: "checked",
          title: title,
          description: description
        }
      ],
      label: label
    }
  end
  let(:component) { FilterMenu::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(title)
    expect(page).to have_text(description)
    expect(page).to have_text(label)
  end
end
