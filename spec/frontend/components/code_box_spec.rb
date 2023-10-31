# frozen_string_literal: true

require "rails_helper"

describe CodeBox::Component do
  let(:options) { {
    code: "{}",
    lang: "ruby"
  } }
  let(:component) { CodeBox::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("pre")
  end
end
