require "rails_helper"

RSpec.describe Audit, type: :model do
  include ActiveJob::TestHelper

  let(:app) do
    FactoryBot.create :app
  end

  let!(:app_user) do
    app.add_user(email: "test@test.cl", first_name: "dsdsa")
  end

  it "test audit on conversation" do
    conversation = app.start_conversation(
      message: { text_content: "aa" },
      from: app_user
    )

    expect(conversation).to be_persisted
    perform_enqueued_jobs do
      conversation.log_async(action: "foo", user: Agent.first, data: { value: conversation.priority })
    end
    expect(conversation.audits).to be_any
    expect(conversation.audits.first.action).to be == "foo"
  end

  it "test audit on agent, nil app" do
    agent = Agent.first
    perform_enqueued_jobs do
      agent.log_async(action: "foo", user: agent, data: {})
    end
    expect(agent.audits).to be_any
    expect(agent.audits.first.action).to be == "foo"
  end
end
