# frozen_string_literal: true

require "rails_helper"

describe ConversationPartBlock::Component do
  let(:app) { FactoryBot.create(:app) }
  let(:conversation) { FactoryBot.create(:conversation, app: app) }
  let(:conversation_part) { FactoryBot.create(:conversation_part, conversation: conversation) }
  let!(:conversation_part_block) { FactoryBot.create(:conversation_part_block, conversation_part: conversation_part) }
  let(:options) do
    {
      app: app,
      message: conversation_part
    }
  end
  let(:component) { ConversationPartBlock::Component.new(**options) }

  subject { rendered_component }

  it "renders" do
    render_inline(component)
    expect(page).to have_css("div")
  end
end
