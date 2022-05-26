# frozen_string_literal: true

require "rails_helper"

RSpec.describe GraphqlController, type: :controller do
  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: "test@test.cl")
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl" }, role_attrs: { access_list: ["manage"], role: "admin" })
  end

  let(:app_user) do
    app.add_user(email: "test@test.cl", first_name: "dsdsa")
  end

  let(:app_user2) do
    app.add_user(email: "admin@test.cl", first_name: "dsdsa")
  end

  let(:conversation_from_agent) do
    app.start_conversation(
      message: { html_content: "message" },
      from: agent_role.agent
    )
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    # ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    # Rails.application.config.active_job.queue_adapter = :test
  end

  before :each do
    stub_current_user(agent_role)
  end

  describe "with conversation" do
    let!(:conversation) do
      app.start_conversation(
        message: { html_content: "message" },
        from: app_user
      )
    end

    it "conversations" do
      graphql_post(type: "CONVERSATIONS", variables: {
                     appKey: app.key,
                     page: 1,
                     filter: nil,
                     sort: nil
                   })
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app.conversations.meta).to be_present
      expect(graphql_response.data.app.conversations.collection).to be_any
    end

    it "get unexisting conversation" do
      graphql_post(type: "CONVERSATION", variables: {
                     appKey: app.key,
                     id: "999"
                   })

      expect(graphql_response.data.app.conversation).to be_blank
    end

    it "create_conversation" do
      expect(app.conversations.count).to be == 1
      expect(conversation.messages.count).to be == 1
      expect(conversation.assignee).to be_blank

      graphql_post(type: "CONVERSATION", variables: {
                     appKey: app.key,
                     id: conversation.key,
                     page: 1
                   })

      expect(graphql_response.data.app.conversation).to_not be_blank
      expect(graphql_response.data.app.conversation.messages.meta).to_not be_blank
      expect(graphql_response.data.app.conversation.messages.collection).to be_any
    end

    it "create_conversation subject" do
      expect(app.conversations.count).to be == 1
      expect(conversation.messages.count).to be == 1
      expect(conversation.assignee).to be_blank

      graphql_post(type: "START_CONVERSATION", variables: {
                     appKey: app.key,
                     subject: "aaa",
                     id: app_user.id.to_s,
                     message: {
                       html: "oli",
                       serialized: "aaa"
                     }
                   })

      expect(graphql_response.data.startConversation.conversation.subject).to be == "aaa"
    end

    it "agent add message" do
      # allow_any_instance_of(Mutations::Conversations::InsertComment).to receive(:current_user).and_return(agent_role.agent)

      graphql_post(type: "INSERT_COMMMENT", variables: {
                     appKey: app.key,
                     id: conversation.key,
                     message: { html: "<p>helo</p>" }
                   })

      expect(graphql_response.data.insertComment.message.message).to_not be_blank
    end
  end

  describe "with package" do
    before :each do
      AppPackagesCatalog.update_all
    end

    let(:app_package) do
      AppPackage.find_by(name: "Twilio")
    end

    let!(:pkg) do
      app.app_package_integrations.create(
        {
          app_package:,
          settings: {
            api_secret: "aaa",
            api_key: "aaa",
            user_id: "1232344232",
            new_conversations_after: 1
          }
        }
      )
    end

    it "create_conversation with initiator" do
      allow_any_instance_of(MessageApis::Twilio::Api).to receive(:prepare_initiator_channel_for).and_return(true)

      graphql_post(type: "START_CONVERSATION", variables: {
                     appKey: app.key,
                     subject: "aaa",
                     id: app_user.id.to_s,
                     initiatorChannel: "Twilio",
                     message: {
                       html: "oli",
                       serialized: "aaa"
                     }
                   })

      expect(graphql_response.data.startConversation.conversation.subject).to be == "aaa"
    end
  end
end
