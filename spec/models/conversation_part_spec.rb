require 'rails_helper'

RSpec.describe ConversationPart, type: :model do
  it{ should belong_to :conversation}
  it{ should belong_to :user}

  before do
    @app = FactoryGirl.create(:app)
    @app.add_user({email: "test@test.cl"})
    @app.add_user({email: "test2@test.cl"})
  end

  it "create will increase count" do
    @app.conversations.create(assignee: @app.users.first)
    expect(@app.conversations.count).to be == 1
  end

  it "add conversation" do
    user = @app.users.last
    @app.add_message(from: user, body: "hello world")
    expect()
  end

  it "assign user" do
  end

  it "close conv" do
  end

end
