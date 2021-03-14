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
      messages: [
        {
          from: sender,
          id: message_id,
          text: {
            body: message_data.blank? ? 'hola' : message_data['text']
          },
          timestamp: '1612635177',
          type: 'text'
        }
      ],
      contacts: [
        {
          profile: {
            name: 'Miguel Michelson'
          },
          wa_id: '1111'
        }
      ],
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'dialog_360',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_media(id:, sender:, recipient:, message_id: nil, message_data: {})
    {

      contacts: [
        {
          profile: {
            name: 'Miguel Michelson'
          },
          wa_id: '56992302305'
        }
      ],

      messages: [{
        from: sender,
        id: message_id,
        image: {
          file: '/usr/local/wamedia/shared/b1cf38-8734-4ad3-b4a1-ef0c10d0d683',
          id: 'b1c68f38-8734-4ad3-b4a1-ef0c10d683',
          mime_type: 'image/jpeg',
          sha256: '29ed500fa64eb55fc19dc4124acb300e5dcc54a0f822a301ae99944db',
          caption: 'Check out my new phone!'
        },
        timestamp: '1521497954',
        type: 'image'
      }],

      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'dialog_360',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_audio(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      messages: [
        {
          from: sender,
          id: message_id,
          timestamp: '1612635177',
          type: 'voice',
          voice: {
            file: '/usr/local/wamedia/shared/463e/b7ec/ff4e4d9bb1101879cbd411b2',
            id: '463eb7ec-ff4e-4d9b-b110-1879cbd411b2',
            mime_type: 'audio/ogg; codecs=opus',
            sha256: 'fa9e1807d936b7cebe63654ea3a7912b1fa9479220258d823590521ef53b0710'
          }
        }
      ],
      contacts: [
        {
          profile: {
            name: 'Miguel Michelson'
          },
          wa_id: '56992302305'
        }
      ],
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'dialog_360',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_video(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      messages: [
        {
          from: sender,
          id: message_id,
          timestamp: '1612635177',
          type: 'video',
          video: {
            file: '/usr/local/wamedia/shared/463e/b7ec/ff4e4d9bb1101879cbd411b2',
            id: '463eb7ec-ff4e-4d9b-b110-1879cbd411b2',
            mime_type: 'audio/ogg; codecs=opus',
            sha256: 'fa9e1807d936b7cebe63654ea3a7912b1fa9479220258d823590521ef53b0710'
          }
        }
      ],
      contacts: [
        {
          profile: {
            name: 'Miguel Michelson'
          },
          wa_id: '56992302305'
        }
      ],
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'dialog_360',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_read(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      statuses: [
        {
          id: message_id,
          recipient_id: '56992302305',
          status: 'delivered',
          timestamp: '1612646286'
        }
      ],
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'dialog_360',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  def data_for_sticker(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      messages: [
        {
          from: sender,
          id: id,
          sticker: {
            id: '2d0eb523-84cd-4bec-ba73-9e06f0721918',
            metadata: {
              "android-app-store-link": 'https://play.google.com/store/apps/details?id=com.dstukalov.walocalstoragestickers',
              "is-first-party-sticker": 0,
              "sticker-pack-id": 'com.dstukalov.walocalstoragestickers.provider cc31886d051b823c638e2ee1e9d763f4',
              "sticker-pack-name": 'Stickers',
              "sticker-pack-publisher": 'You'
            },
            mime_type: 'image/webp',
            sha256: '0a7d1c4ddac8547ee866f2b5366443ba8eddbc130acfaf7fc9b5d66a860f84f6'
          },
          timestamp: '1612664666',
          type: 'sticker'
        }
      ],
      contacts: [
        {
          profile: {
            name: 'Miguel Michelson'
          },
          wa_id: sender
        }
      ],
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'dialog_360',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent({ email: 'test2@test.cl' })
  end

  let(:app_package) do
    1
    AppPackage.find_by(name: 'Dialog360')
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

      allow_any_instance_of(MessageApis::Dialog360::Api).to receive(
        :direct_upload
      ).and_return('/direct-upload-mock')
    end

    it 'receive conversation data' do
      get(:process_event,
          params: data_for(id: @pkg.id,
                           sender: owner_phone,
                           recipient: user_phone,
                           message_id: '1234'))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any
      expect(app.conversations.last.main_participant.name).to eql('Miguel Michelson')
      expect(app.conversations.last.messages.last.conversation_part_channel_sources).to be_any
    end

    it 'receive conversation media' do
      get(:process_event,
          params: data_for_media(
            id: @pkg.id,
            sender: owner_phone,
            recipient: user_phone,
            message_id: '1234'
          ))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('/direct-upload-mock')
    end

    it 'receive conversation video' do
      get(:process_event,
          params: data_for_video(
            id: @pkg.id,
            sender: owner_phone,
            recipient: user_phone,
            message_id: '1234'
          ))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('/direct-upload-mock')
    end

    it 'receive conversation audio' do
      get(:process_event,
          params: data_for_audio(
            id: @pkg.id,
            sender: owner_phone,
            recipient: user_phone,
            message_id: '1234'
          ))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('/direct-upload-mock')
    end

    it 'receive conversation sticker' do
      get(:process_event,
          params: data_for_sticker(
            id: @pkg.id,
            sender: owner_phone,
            recipient: user_phone,
            message_id: '1234'
          ))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include('/direct-upload-mock')
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

    it 'reply from agent on dialog_360' do
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
