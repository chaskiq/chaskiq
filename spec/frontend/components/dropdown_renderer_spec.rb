# frozen_string_literal: true

require "rails_helper"

describe DropdownRenderer::Component do
  let(:options) do
    {
      id: "foo",
      align: "center",
      variant: "flat-dark",
      direction: "right",
      label: "label",
      value: "dd",
      options: [
        {
          href: "https://example.com",
          data: "data",
          icon: "x-mark",
          text: "this is an option"
        },
        {
          href: "https://www.foo.com",
          data: "data 1",
          icon: "x-mark",
          text: "this is another option"
        }
      ]
    }
  end
  let(:component) { DropdownRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("select")
    expect(page).to have_css("option", count: options[:options].size + 1)
    expect(page).to have_text(options[:options][0][:text])
    expect(page).to have_text(options[:options][1][:text])
  end
end
