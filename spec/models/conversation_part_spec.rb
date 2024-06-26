# frozen_string_literal: true

require "rails_helper"

RSpec.describe ConversationPart, type: :model do
  # it{ should belong_to :conversation}
  # it{ should belong_to :app_user}

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: "test@test.cl")
  end

  let!(:agent) do
    app.add_agent({ email: "test2@test.cl" })
  end

  let(:serialized) do
    {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "bar" }] }]
    }.to_json
  end

  context "conversation" do
    before :each do
      AppIdentity.new(app.key).delete
    end

    let!(:conversation) do
      app.conversations.create(main_participant: app.app_users.first)
    end

    it "will be opened" do
      expect(conversation).to be_opened
    end

    it "will be closed" do
      conversation.close!
      expect(conversation).to be_closed
    end

    it "will increase count" do
      expect(app.conversations.count).to be == 1
    end

    it "add message from app user" do
      conversation.add_message(from: app.app_users.first, message: { html_content: "foo", serialized_content: serialized })
      expect(conversation.messages.count).to be == 1
      expect(conversation.messages.first.authorable).to be_present
      expect(conversation.messages.first.message.html_content).to be_present
      expect(conversation.messages.first.message.serialized_content).to be_present
    end

    it "add message from agent" do
      conversation.add_message(from: app.agents.first, message: { html_content: "foo", serialized_content: serialized })
      expect(conversation.messages.count).to be == 1
      expect(conversation.messages.first.authorable).to be_present
      expect(conversation.messages.first.message.html_content).to be_present
      expect(conversation.messages.first.message.serialized_content).to be_present
    end

    it "assign user" do
      conversation.assign_user(app.agents.last)
      expect(conversation.assignee).to be == app.agents.last
      expect(conversation.messages.last.messageable.action).to be == "assigned"
      # expect(conversation.messages.last.messageable.data).to be == "assigned"
    end

    it "app user metrics incoming" do
      conversation.add_message(
        from: app.app_users.first,
        message: { html_content: "foo", serialized_content: serialized }
      )

      expect(AppIdentity.new(app.key).incoming_messages.get).to be_present
    end

    it "agent metrics outgoing" do
      conversation.add_message(
        from: app.agents.first,
        message: {
          html_content: "foo",
          serialized_content: serialized
        }
      )

      expect(AppIdentity.new(app.key).outgoing_messages.get).to be_present
    end

    it "read does not touch conversations" do
      conversation.add_message(from: app.agents.first, message: { html_content: "foo", serialized_content: serialized })
      u1 = conversation.reload.updated_at
      conversation.messages.first.read!
      expect(conversation.reload.updated_at).to be == u1

      conversation.messages.first.save
      expect(conversation.reload.updated_at).to_not be == u1
    end

    it "a save does touch conversations" do
      conversation.add_message(from: app.agents.first, message: { html_content: "foo", serialized_content: serialized })
      u1 = conversation.reload.updated_at
      conversation.messages.first.save
      expect(conversation.reload.updated_at).to_not be == u1
    end
  end
end
