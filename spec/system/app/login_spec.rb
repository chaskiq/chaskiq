require "rails_helper"
require "sidekiq/testing"

RSpec.describe "Widget management", type: :system do
  let!(:app) do
    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled")
  end

  let!(:user) do
    app.add_user({ email: "test2@test.cl" })
  end

  let!(:agent_role) do
    app.add_agent({ email: "miguel.michelson@cience.com", name: "test agent" })
  end

  let(:assignment_rule) do
    lambda { |rules|
      app.assignment_rules.create({
                                    title: "test",
                                    agent: agent_role.agent,
                                    conditions: rules || [],
                                    priority: 1
                                  })
    }
  end

  let(:user_auto_message) do
    FactoryBot.create(:user_auto_message, app: app)
  end

  def serialized_content(text = "foobar")
    "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
  end

  def setting_for_user(
    enabled: false,
    users: true,
    user_segment: "all",
    user_options: [],
    visitors: true,
    visitor_options: [],
    visitor_segment: "all"
  )
    settings = {
      "enabled" => enabled,
      "users" => { "enabled" => users, "segment" => user_segment, "predicates" => user_options },
      "visitors" => { "enabled" => visitors, "segment" => visitor_segment, "predicates" => visitor_options }
    }
    app.update(inbound_settings: settings)
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    # Rails.application.config.active_job.queue_adapter = :test
  end

  context "translations" do
    before :each do
    end

    it "login view" do
      login
    end
  end
end
