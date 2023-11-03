# frozen_string_literal: true

require "rails_helper"

describe Modal::Component do
  let(:title) { "This is a title" }
  let(:action_content) { "Modal content" }
  let(:options) do
    {
      title: title,
      action_content: action_content
    }
  end
  let(:component) { Modal::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)

    expect(page).to have_css("div")
    expect(page).to have_text(title)
    expect(page).to have_text(action_content)
    expect(page).to have_text(I18n.t("common.cancel"))
  end
end
