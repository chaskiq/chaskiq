require "rails_helper"

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  include ActiveJob::TestHelper

  let(:owner_phone) do
    "+1111"
  end

  let(:user_phone) do
    "+2222"
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl" })
  end

  let(:app_package) do
    AppPackage.find_by(name: "TwilioPhone")
  end

  ## ringing:
  let(:ringing_request) do
    {
      "AccountSid" => "ACa99e0b29e5f2652c432d79c4a09f3128",
      "ApiVersion" => "2010-04-01",
      "CallSid" => "CAb8668898488dbd7472368b3a932a03f7",
      "CallStatus" => "ringing",
      "CallToken" => "[FILTERED]",
      "Called" => "+19402456692",
      "CalledCity" => "HENRIETTA",
      "CalledCountry" => "US",
      "CalledState" => "TX",
      "CalledZip" => "76365",
      "Caller" => "+56992302305",
      "CallerCity" => "",
      "CallerCountry" => "CL",
      "CallerState" => "",
      "CallerZip" => "",
      "Direction" => "inbound",
      "From" => "+56992302305",
      "FromCity" => "",
      "FromCountry" => "CL",
      "FromState" => "",
      "FromZip" => "",
      "To" => "+19402456692",
      "ToCity" => "HENRIETTA",
      "ToCountry" => "US",
      "ToState" => "TX",
      "ToZip" => "76365",
      "id" => "mnrdq86ngnyA7Ajxgng2mythny7vmrdrkm7vqvblgm5q"
    }
  end

  let(:error_request) do
    {
      "AccountSid" => "ACa99e0b29e5f2652c432d79c4a09f3128",
      "ApiVersion" => "2010-04-01",
      "CallSid" => "CAb8668898488dbd7472368b3a932a03f7",
      "CallStatus" => "ringing",
      "CallToken" => "[FILTERED]",
      "Called" => "+19402456692",
      "CalledCity" => "HENRIETTA",
      "CalledCountry" => "US",
      "CalledState" => "TX",
      "CalledZip" => "76365",
      "Caller" => "+56992302305",
      "CallerCity" => "",
      "CallerCountry" => "CL",
      "CallerState" => "",
      "CallerZip" => "",
      "Direction" => "inbound",
      "ErrorCode" => "12300",
      "ErrorUrl" => "https://chaskiq.ngrok.io/api/v1/hooks/receiver/mnrdq86ngnyA7Ajxgng2mythny7vmrdrkm7vqvblgm5q",
      "From" => "+56992302305",
      "FromCity" => "",
      "FromCountry" => "CL",
      "FromState" => "", "FromZip" => "",
      "To" => "+19402456692",
      "ToCity" => "HENRIETTA",
      "ToCountry" => "US",
      "ToState" => "TX",
      "ToZip" => "76365",
      "id" => "mnrdq86ngnyA7Ajxgng2mythny7vmrdrkm7vqvblgm5q"
    }
  end

  # completed:
  let(:completed) do
    { "Called" => "+19402456692",
      "ToState" => "TX",
      "CallerCountry" => "CL",
      "Direction" => "inbound",
      "Timestamp" => "Thu, 17 Mar 2022 21:55:12 +0000",
      "CallbackSource" => "call-progress-events",
      "CallerState" => "",
      "ToZip" => "76365",
      "SequenceNumber" => "0",
      "To" => "+19402456692",
      "CallSid" => "CAb8668898488dbd7472368b3a932a03f7",
      "ToCountry" => "US",
      "CallerZip" => "",
      "CalledZip" => "76365",
      "ApiVersion" => "2010-04-01",
      "CallStatus" => "completed",
      "CalledCity" => "HENRIETTA",
      "Duration" => "1",
      "From" => "+56992302305",
      "CallDuration" => "2",
      "AccountSid" => "ACa99e0b29e5f2652c432d79c4a09f3128",
      "CalledCountry" => "US",
      "CallerCity" => "",
      "ToCity" => "HENRIETTA",
      "FromCountry" => "CL",
      "Caller" => "+56992302305",
      "FromCity" => "",
      "CalledState" => "TX",
      "FromZip" => "",
      "FromState" => "",
      "id" => "mnrdq86ngnyA7Ajxgng2mythny7vmrdrkm7vqvblgm5q" }
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
        api_secret: "aaa",
        api_key: "aaa",
        user_id: owner_phone,
        app_package:
      )
    end

    it "receive inbound conversation data" do
      pending("not implemented specs")
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
  end
end
