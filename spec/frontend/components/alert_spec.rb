# frozen_string_literal: true

require "rails_helper"

describe Alert::Component do
  let(:options) { {
      title: "foo",
      message: "foo",
      status: "notice"
    } 
  }
  let(:component) { Alert::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css(".alert")
  end
end
