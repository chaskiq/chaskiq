require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do

  let(:owner_phone){
    'whatsapp:+1111'
  }

  let(:user_phone){
    'whatsapp:+2222'
  }

  def data_for(id: , sender: , recipient: , message_id: nil, message_data: {} )
    {
      "SmsMessageSid"=> message_id,
      "NumMedia"=>"0",
      "SmsSid"=> message_id,
      "SmsStatus"=>"received",
      "Body"=> message_data.blank? ? "hola" : message_data["text"],
      "To"=> recipient, 
      "NumSegments"=>"1",
      "MessageSid"=> message_id,
      "AccountSid"=>"ACe290",
      "From"=>sender, 
      "ApiVersion"=>"2010-04-01",
      "controller"=>"api/v1/hooks/provider",
      "action"=>"process_event",
      "provider"=>"twilio", 
      "app_key"=>app.key, 
      "id"=>@pkg.id
    }
  end

  def data_for_media(id: , sender: , recipient: , message_id: nil, message_data: {} )
    {
      "MediaContentType0"=>"image/jpeg", 
      "SmsMessageSid"=>message_id, 
      "NumMedia"=>"1", 
      "SmsSid"=>message_id,
      "SmsStatus"=>"received", 
      "Body"=>"", 
      "To"=>"whatsapp:+1111", 
      "NumSegments"=>"1", 
      "MessageSid"=>message_id, 
      "AccountSid"=>"ACe290", 
      "From"=>"whatsapp:+2222", 
      "MediaUrl0"=>"https://api.twilio.com/2010-04-01/Accounts/AAAA/Messages/AAAAAAAAA/Media/MEf98b16d258dbb7380e44996a3337c54c", 
      "ApiVersion"=>"2010-04-01", 
      "action"=>"process_event", 
      "provider"=>"twilio", 
      "controller"=>"api/v1/hooks/provider",
      "app_key"=>app.key, 
      "id"=>@pkg.id    }
  end


  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent(email: 'test2@test.cl')
  end

  let!(:app_package) do
    definitions = [
      {
        name: 'api_secret',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: 'api_key',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: 'user_id',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      }
    ]

    AppPackage.create(name: 'Twilio', definitions: definitions)
  end


  describe "hooks" do
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
        app_package: app_package
      )
    end
  
    it "receive conversation data" do
      get(:process_event, 
        params: data_for({
          id: @pkg.id, 
          sender: owner_phone, 
          recipient: user_phone,
          message_id: "1234"
        })
      )
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any
      expect(app.conversations.last.messages.last.conversation_part_channel_sources).to be_any
    end

    it "receive conversation media" do

      get(:process_event, 
        params: data_for_media({
          id: @pkg.id, 
          sender: owner_phone, 
          recipient: user_phone,
          message_id: "1234"
        })
      )
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('https://api.twilio.com/')
      
    end

    it "receive two messages in single conversation" do

      expect(app.app_users).to be_empty

      get(:process_event, params: data_for(
        id: @pkg.id, 
        sender: user_phone, 
        recipient: owner_phone,
        message_id: "1234")
      )

      expect(app.app_users.size).to be == 1

      get(:process_event, params: data_for(
        id: @pkg.id, 
        sender: user_phone, 
        recipient: owner_phone,
        message_id: "1235")
      )

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
        )
      )

      get(:process_event, params: data_for(
        id: @pkg.id, 
        sender: owner_phone, 
        recipient: user_phone,
        message_id: 2
      )
      )

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
            "text"=> "one\ntwo\ntree\n✌️"
          }
        )
      )

      message = app.conversations.first.messages.first.messageable

      expect(message.html_content).to be == "one\ntwo\ntree\n✌️"
      expect(message.serialized_content).to be_present

      blocks = JSON.parse(message.serialized_content)["blocks"]

      expect(blocks.size).to be == 4
    end


  end

end