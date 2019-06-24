require 'rails_helper'

RSpec.describe ConversationPart, type: :model do
  #it{ should belong_to :conversation}
  #it{ should belong_to :app_user}

  let!(:app){
    FactoryGirl.create(:app)
  }

  let!(:user){
    app.add_user({email: "test@test.cl"})
  }

  let!(:agent){
    app.add_agent({email: "test2@test.cl"})
  }

  context "conversation" do

    let!(:conversation){
      app.conversations.create(main_participant: app.app_users.first)
    }

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
      conversation.add_message(from: app.app_users.first, message: {html_content: "foo", serialized_content: "bar"})
      expect(conversation.messages.count).to be == 1
      expect(conversation.messages.first.authorable).to be_present
      expect(conversation.messages.first.html_content).to be_present
      expect(conversation.messages.first.serialized_content).to be_present
    end

    it "add message from agent" do
      conversation.add_message(from: app.agents.first, message: {html_content: "foo", serialized_content: "bar"})
      expect(conversation.messages.count).to be == 1
      expect(conversation.messages.first.authorable).to be_present
      expect(conversation.messages.first.html_content).to be_present
      expect(conversation.messages.first.serialized_content).to be_present
    end

    it "assign user" do
      conversation.assign_user(app.agents.last)
      expect(conversation.assignee).to be == app.agents.last
    end

  end



end
