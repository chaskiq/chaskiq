require "rails_helper"
include ActiveJob::TestHelper

class SuccessMock
  attr_accessor :body

  def success?
    true
  end
end

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  let(:owner_phone) do
    "whatsapp:+1111"
  end

  let(:user_phone) do
    "whatsapp:+2222"
  end

  def data_for(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "SmsMessageSid" => message_id,
      "NumMedia" => "0",
      "SmsSid" => message_id,
      "SmsStatus" => "received",
      "Body" => message_data.blank? ? "hola" : message_data["text"],
      "To" => recipient,
      "NumSegments" => "1",
      "MessageSid" => message_id,
      "AccountSid" => "ACe290",
      "From" => sender,
      "ApiVersion" => "2010-04-01",
      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "twilio",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  def data_for_media(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "MediaContentType0" => "image/jpeg",
      "SmsMessageSid" => message_id,
      "NumMedia" => "1",
      "SmsSid" => message_id,
      "SmsStatus" => "received",
      "Body" => "",
      "To" => "whatsapp:+1111",
      "NumSegments" => "1",
      "MessageSid" => message_id,
      "AccountSid" => "ACe290",
      "From" => "whatsapp:+2222",
      "MediaUrl0" => "https://api.twilio.com/2010-04-01/Accounts/AAAA/Messages/AAAAAAAAA/Media/MEf98b16d258dbb7380e44996a3337c54c",
      "ApiVersion" => "2010-04-01",
      "action" => "process_event",
      "provider" => "twilio",
      "controller" => "api/v1/hooks/provider",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl" })
  end

  let(:app_package) do
    AppPackage.find_by(name: "Twilio")
  end

  describe "hooks" do
    before do
      AppPackagesCatalog.update_all
    end
    before :each do
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false

      AppPackageIntegration.any_instance
                           .stub(:handle_registration)
                           .and_return({})

      @pkg = app.app_package_integrations.create(
        {
          app_package:,
          settings: {
            api_secret: "aaa",
            api_key: "aaa",
            user_id: owner_phone,
            new_conversations_after: 1
          }
        }
      )
    end

    it "receive conversation data" do
      get(:process_event,
          params: data_for(
            id: @pkg.id,
            sender: owner_phone,
            recipient: user_phone,
            message_id: "1234"
          ))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any
      expect(app.conversations.last.messages.last.conversation_part_channel_sources).to be_any
    end

    it "receive conversation media" do
      get(:process_event,
          params: data_for_media(
            id: @pkg.id,
            sender: owner_phone,
            recipient: user_phone,
            message_id: "1234"
          ))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include("https://api.twilio.com/")
    end

    it "receive two messages in single conversation" do
      expect(app.app_users).to be_empty

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_id: "1234"
      ))
      perform_enqueued_jobs

      expect(app.app_users.size).to be == 1

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_id: "1235"
      ))
      perform_enqueued_jobs

      expect(app.app_users.size).to be == 1

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
    end

    it "reply from agent on twilio" do
      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_id: 1
      ))

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: owner_phone,
        recipient: user_phone,
        message_id: 2
      ))
      perform_enqueued_jobs

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
      expect(app.conversations.first.messages.last.authorable).to be_a(Agent)
    end

    it "receive text with breakline" do
      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_data: {
          "text" => "one\ntwo\ntree\n✌️"
        }
      ))
      perform_enqueued_jobs

      message = app.conversations.first.messages.first.messageable

      expect(message.html_content).to be == "one\ntwo\ntree\n✌️"
      expect(message.serialized_content).to be_present

      blocks = JSON.parse(message.serialized_content)["blocks"]

      expect(blocks.size).to be == 4
    end

    describe "process message" do
      before :each do
        get(:process_event,
            params: data_for(
              id: @pkg.id,
              sender: owner_phone,
              recipient: user_phone,
              message_id: "1234"
            ))
        perform_enqueued_jobs
      end

      it "#send_message, create message from conversation" do
        opts = {
          from: Agent.first,
          message: {
            serialized_content: { blocks: [] }.to_json,
            html_content: "message"
          }
        }

        body = {}.to_json
        success_mock = SuccessMock.new
        success_mock.body = body

        expect_any_instance_of(Faraday::Connection).to receive(:post).and_return(
          success_mock
        )

        Conversation.last.add_message(opts)
        perform_enqueued_jobs
      end

      it "#send_message, create message from conversation" do
        opts = {
          private_note: true,
          from: Agent.first,
          message: {
            serialized_content: { blocks: [] }.to_json,
            html_content: "message"
          }
        }

        expect_any_instance_of(Faraday::Connection).to_not receive(:post)

        Conversation.last.add_message(opts)
        perform_enqueued_jobs
      end
    end

    describe "thread slicing" do
      it "second message will create a new conversation when time is up" do
        expect(app.app_users).to be_empty

        get(:process_event, params: data_for(
          id: @pkg.id,
          sender: user_phone,
          recipient: owner_phone,
          message_id: "1234"
        ))
        perform_enqueued_jobs

        expect(app.app_users.size).to be == 1

        Conversation.any_instance
                    .stub(:latest_user_visible_comment_at)
                    .and_return(10.hours.ago)

        get(:process_event, params: data_for(
          id: @pkg.id,
          sender: user_phone,
          recipient: owner_phone,
          message_id: "1235"
        ))
        perform_enqueued_jobs

        expect(app.app_users.size).to be == 1

        expect(response.status).to be == 200
        expect(app.conversations.count).to be == 2
        expect(app.conversations.first.messages.count).to be == 1
        expect(app.conversations.last.messages.count).to be == 1
        expect(app.conversations.first).to be_closed
        expect(app.conversations.first.conversation_channels).to be_empty
      end

      it "second message will be kept in same conversation when in time" do
        expect(app.app_users).to be_empty

        get(:process_event, params: data_for(
          id: @pkg.id,
          sender: user_phone,
          recipient: owner_phone,
          message_id: "1234"
        ))
        perform_enqueued_jobs

        expect(app.app_users.size).to be == 1

        Conversation.any_instance
                    .stub(:latest_user_visible_comment_at)
                    .and_return(10.minutes.ago)

        get(:process_event, params: data_for(
          id: @pkg.id,
          sender: user_phone,
          recipient: owner_phone,
          message_id: "1235"
        ))
        perform_enqueued_jobs

        expect(app.app_users.size).to be == 1

        expect(response.status).to be == 200
        expect(app.conversations.count).to be == 1
        expect(app.conversations.first.messages.count).to be == 2
        expect(app.conversations.first).to be_opened
        expect(app.conversations.first.conversation_channels).to be_present
      end

      it "second message will create a new conversation if current convo is closed" do
        expect(app.app_users).to be_empty

        get(:process_event, params: data_for(
          id: @pkg.id,
          sender: user_phone,
          recipient: owner_phone,
          message_id: "1234"
        ))
        perform_enqueued_jobs

        expect(app.app_users.size).to be == 1

        app.conversations.first.close!

        get(:process_event, params: data_for(
          id: @pkg.id,
          sender: user_phone,
          recipient: owner_phone,
          message_id: "1235"
        ))

        perform_enqueued_jobs

        expect(app.app_users.size).to be == 1

        expect(response.status).to be == 200
        expect(app.conversations.count).to be == 2
        expect(app.conversations.first.messages.count).to be == 1
        expect(app.conversations.last.messages.count).to be == 1
        expect(app.conversations.first).to be_closed
        expect(app.conversations.first).to be_blocked
        expect(app.conversations.first.blocked_reason).to_not be_blank
        expect(app.conversations.first.conversation_channels).to be_empty
      end
    end
  end
end
