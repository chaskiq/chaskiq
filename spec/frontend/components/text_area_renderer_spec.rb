# frozen_string_literal: true

require "rails_helper"

describe TextAreaRenderer::Component do
  let(:label) { "label" }
  let(:options) do
    {
      id: "foo",
      label: label,
      placeholder: "",
      save_state: "",
      disabled: "",
      loading: "",
      name: "",
      hint: "",
      errors: ""
    }
  end
  let(:component) { TextAreaRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div.input-wrapper")
    expect(page).to have_text(label)
    expect(page).to have_css("textarea")
  end
end
