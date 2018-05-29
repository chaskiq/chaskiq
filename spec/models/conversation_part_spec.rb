require 'rails_helper'

RSpec.describe ConversationPart, type: :model do
  it{ should belong_to :conversation}
  it{ should belong_to :user}

  before do
    @app = FactoryGirl.create(:app)
    @app.add_user({email: "test@test.cl"})
    @app.add_user({email: "test2@test.cl"})
  end

  context "conversation" do

    let!(:conversation){
      @app.conversations.create(main_participant: @app.users.first)
    }

    it "will be opened" do
      expect(conversation).to be_opened
    end

    it "will be closed" do
      conversation.close!
      expect(conversation).to be_closed
    end

    it "will increase count" do
      expect(@app.conversations.count).to be == 1
    end

    it "add message" do
      conversation.add_message(from: @app.users.first, message: "foo")
      expect(conversation.messages.count).to be == 1
    end

    it "assign user" do
      conversation.assign_user(@app.users.last)
      expect(conversation.assignee).to be == @app.users.last
    end

  end



end
