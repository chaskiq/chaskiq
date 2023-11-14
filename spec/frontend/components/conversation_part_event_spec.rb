# frozen_string_literal: true

require "rails_helper"

describe ConversationPartEvent::Component do
  let(:app) { FactoryBot.create(:app) }
  let(:conversation) { FactoryBot.create(:conversation, app: app) }
  let(:conversation_part) { FactoryBot.create(:conversation_part, conversation: conversation) }
  let!(:conversation_part_event) { FactoryBot.create(:conversation_part_event, conversation_part: conversation_part) }
  let(:options) do
    {
      app: app,
      message: conversation_part
    }
  end
  let(:component) { ConversationPartEvent::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
