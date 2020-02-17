require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe OutgoingWebhook, type: :model do

  let(:app) { FactoryBot.create :app }
  let(:app_user) do
    app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
  end

  let(:app_user2) do
    app.add_user(email: 'admin@test.cl', first_name: 'dsdsa')
  end

  let!(:agent_role) do
    app.add_agent(email: 'agent1@test.cl')
  end

  let(:webhook) do
    app.outgoing_webhooks.create(
      url: "https://hookb.in/7ZBaarpVbpTr7ZqQgjna",
      tag_list: ["users.created", "email_changed"]
    )
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_jobs = true
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
  end

  #it "will create webhook" do
  #  expect(webhook).to be_present
  #  expect(webhook.send_notification).to be 200
  #end

  it "will send webhook" do
    perform_enqueued_jobs do
      webhook.update(state: "enabled")

      save_count = 0
      allow_any_instance_of(OutgoingWebhookService).to receive(:send_post) { |arg| 
        save_count += 1 
        200
      }
      app_user
      expect(save_count).to be == 2
    end
  end

  it "will not webhook" do
    perform_enqueued_jobs do
      webhook.update(state: "disabled")

      save_count = 0
      allow_any_instance_of(OutgoingWebhookService).to receive(:send_post) { |arg| 
        save_count += 1 
        200
      }
      app_user
      expect(save_count).to be == 0
    end
  end

end
