# frozen_string_literal: true

require "rails_helper"

describe ConversationPart::Component do
  let(:app) { FactoryBot.create(:app) }
  let(:app_user) { FactoryBot.create(:user, app: app)}
  let(:conversation) { FactoryBot.create(:conversation, app: app, main_participant: app_user) }
  let(:conversation_part) do
    FactoryBot.create(:conversation_part,
      conversation: conversation,
      authorable: app.agent_bots.first
    )
  end
  let!(:conversation_part_content) do
    FactoryBot.create(:conversation_part_content, conversation_part: conversation_part)
  end
  let(:options) {
    {
      app: app,
      message: conversation_part
    }
  }
  let(:component) { ConversationPart::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
