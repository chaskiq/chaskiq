require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  let(:owner_phone) do
    '1111'
  end

  let(:user_phone) do
    '2222'
  end

  def data_for(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "message_uuid": message_id,
      "from": {	"type": 'whatsapp',	"number": sender },
      "to": { "type": 'whatsapp', "number": recipient },
      "message": {
        "content": {
          "type": 'text',
          "text": message_data.blank? ? 'hola' : message_data['text']
        }
      },
      "timestamp": '2021-02-03T18:04:52.936Z',

      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'vonage',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_media(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "message_uuid": message_id,
      "from": {	"type": 'whatsapp',	"number": sender },
      "to": { "type": 'whatsapp', "number": recipient },
      "message": {
        "content": {
          "type": 'image',
          "image": {
            "url": 'https://api.nexmo.com/v3/media/c7e601e8-708b-4fc3-b7cf-92f60c185cd4',
            "caption": 'hola'
          }
        }
      },
      "timestamp": '2021-02-03T18:10:40.311Z',

      # "MediaContentType0"=>"image/jpeg",
      # "SmsMessageSid"=>message_id,
      # "NumMedia"=>"1",
      # "SmsSid"=>message_id,
      # "SmsStatus"=>"received",
      # "Body"=>"",
      # "To"=>"whatsapp:+1111",
      # "NumSegments"=>"1",
      # "MessageSid"=>message_id,
      # "AccountSid"=>"ACe290",
      # "From"=>"whatsapp:+2222",
      # "MediaUrl0"=>"https://api.twilio.com/2010-04-01/Accounts/AAAA/Messages/AAAAAAAAA/Media/MEf98b16d258dbb7380e44996a3337c54c",
      # "ApiVersion"=>"2010-04-01",
      'action' => 'process_event',
      'provider' => 'vonage',
      'controller' => 'api/v1/hooks/provider',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_audio(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "message_uuid": message_id,
      "from": {	"type": 'whatsapp',	"number": sender },
      "to": { "type": 'whatsapp', "number": recipient },
      "message": {
        "content": {
          "type": 'audio',
          "audio": {
            "url": 'https://api.nexmo.com/v3/media/7a620c45-3d75-4b42-a29f-0379a3798169'
          }
        }
      },
      "timestamp": '2021-02-03T18:10:40.311Z',
      'action' => 'process_event',
      'provider' => 'vonage',
      'controller' => 'api/v1/hooks/provider',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_video(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "message_uuid": message_id,
      "from": {	"type": 'whatsapp',	"number": sender },
      "to": { "type": 'whatsapp', "number": recipient },
      "message": {
        "content": {
          "type": 'video',
          "video": {
            "url": 'https://api.nexmo.com/v3/media/ae78f99c-4dde-4dd7-81e0-81b71a6dba13',
            "caption": 'iojij'
          }
        }
      },
      "timestamp": '2021-02-03T18:10:40.311Z',
      'action' => 'process_event',
      'provider' => 'vonage',
      'controller' => 'api/v1/hooks/provider',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_read(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      "message_uuid": '1f882e4c-75d1-4625-aa0a-2e5f8e068de9',
      "from": {
        "type": 'whatsapp',
        "number": '14157386170'
      },
      "to": {
        "type": 'whatsapp',
        "number": '56992302305'
      },
      "timestamp": '2021-02-04T03:05:17.616Z',
      "status": 'read'
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent({ email: 'test2@test.cl' })
  end

  let(:app_package) do
    AppPackage.find_by(name: 'Vonage')
  end

  describe 'hooks' do
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
        api_secret: 'aaa',
        api_key: 'aaa',
        user_id: owner_phone,
        app_package: app_package,
        sandbox: true
      )
    end

    it 'receive conversation data' do
      get(:process_event,
          params: data_for({
                             id: @pkg.id,
                             sender: owner_phone,
                             recipient: user_phone,
                             message_id: '1234'
                           }))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any
      expect(app.conversations.last.messages.last.conversation_part_channel_sources).to be_any
    end

    it 'receive conversation media' do
      get(:process_event,
          params: data_for_media({
                                   id: @pkg.id,
                                   sender: owner_phone,
                                   recipient: user_phone,
                                   message_id: '1234'
                                 }))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('https://api.nexmo.com/v3/media/')
    end

    it 'receive conversation video' do
      get(:process_event,
          params: data_for_video({
                                   id: @pkg.id,
                                   sender: owner_phone,
                                   recipient: user_phone,
                                   message_id: '1234'
                                 }))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('https://api.nexmo.com/v3/media/')
    end

    it 'receive conversation audio' do
      get(:process_event,
          params: data_for_audio({
                                   id: @pkg.id,
                                   sender: owner_phone,
                                   recipient: user_phone,
                                   message_id: '1234'
                                 }))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any

      expect(message.messageable.serialized_content).to include('https://api.nexmo.com/v3/media/')
    end

    it 'receive two messages in single conversation' do
      expect(app.app_users).to be_empty

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_id: '1234'
      ))

      expect(app.app_users.size).to be == 1

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_id: '1235'
      ))

      expect(app.app_users.size).to be == 1

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
    end

    it 'reply from agent on vonage' do
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

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
      expect(app.conversations.first.messages.last.authorable).to be_a(Agent)
    end

    it 'receive text with breakline' do
      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        recipient: owner_phone,
        message_data: {
          'text' => "one\ntwo\ntree\n✌️"
        }
      ))

      message = app.conversations.first.messages.first.messageable

      expect(message.html_content).to be == "one\ntwo\ntree\n✌️"
      expect(message.serialized_content).to be_present

      blocks = JSON.parse(message.serialized_content)['blocks']

      expect(blocks.size).to be == 4
    end
  end
end
