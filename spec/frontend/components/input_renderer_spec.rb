# frozen_string_literal: true

require "rails_helper"

describe InputRenderer::Component do
  let(:label) { "Foo" }
  let(:options) do
    {
      id: "id_1",
      label: label,
      placeholder: "fill with some text",
      save_state: "",
      name: "input name"
    }
  end
  let(:component) { InputRenderer::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(label)
  end
end
