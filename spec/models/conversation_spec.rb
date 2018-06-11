require 'rails_helper'

RSpec.describe Conversation, type: :model do
  it{ should have_many :messages}
  it{ should belong_to :app}

  let(:app){ FactoryGirl.create :app}
  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  it "create_conversation" do
    app.start_conversation({
      message: "message", 
      from: app_user.user
    })
    expect(app.conversations.count).to be == 1
    expect(app.conversations.first.messages.count).to be == 1
  end

  context "add message" do

    before :each do 
      app.start_conversation({
        message: "message", 
        from: app_user.user
      })
    end

    it "add message" do
      message = app.conversations.first.add_message({
        from: app_user.user,
        message: "foobar"
      })
      expect(message).to be_persisted
    end

  end

end