require 'rails_helper'

RSpec.describe Conversation, type: :model do
  #it{ should have_many :messages}
  #it{ should belong_to :app}

  let(:app){ FactoryGirl.create :app}
  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  let(:app_user2){ 
    app.add_user({email: "admin@test.cl", first_name: "dsdsa"})
  }

  it "create_conversation" do

    app.add_admin(app_user2.user)

    app.start_conversation({
      message: "message", 
      from: app_user
    })
    expect(app.conversations.count).to be == 1
    expect(app.conversations.first.messages.count).to be == 1
    expect(app.conversations.first.assignee).to be_present
  end

  context "add message" do

    subject(:conversation){
      app.start_conversation({
        message: "message", 
        from: app_user
      })
    }

    it "add message" do
      expect(conversation.messages.count).to be == 1
      expect(ConversationsChannel).to receive(:broadcast_to)
      expect_any_instance_of(ConversationPart).to receive(:enqueue_email_notification)
      message = conversation.add_message({
        from: app_user,
        message: "foobar"
      })
      expect(message).to be_persisted
    end

  end

  context "add private message" do

    subject(:conversation){
      app.start_conversation({
        message: "message", 
        from: app_user
      })
    }

    it "add message" do
      expect(conversation.messages.count).to be == 1
      expect(ConversationsChannel).to_not receive(:broadcast_to)
      expect_any_instance_of(ConversationPart).to_not receive(:enqueue_email_notification)

      message = conversation.add_private_note({
        from: app_user,
        message: "foobar"
      })
      expect(message).to be_persisted
      expect(conversation.messages.count).to be == 2
    end

  end



end