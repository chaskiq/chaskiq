require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  let(:owner_phone) do
    '+1111'
  end

  let(:user_phone) do
    '+2222'
  end

  def contact
    { contact: {
      id: '75ef52b66cf24ebcbac8727cd4316ea8',
      href: '',
      msisdn: 56_992_302_305,
      displayName: 'Miguel Michelson',
      firstName: '',
      lastName: '',
      customDetails: {},
      attributes: {},
      createdDatetime: '2021-02-02T20:37:30Z',
      updatedDatetime: '2021-02-02T20:37:30Z'
    } }
  end

  def conversation
    {
      conversation: {
        id: '7b2223447c3441e7961aab583ebe8d14',
        contactId: '75ef52b66cf24ebcbac8727cd4316ea8',
        status: 'active',
        createdDatetime: '2021-02-02T20:37:30Z',
        updatedDatetime: '2021-02-08T13:18:43Z',
        lastReceivedDatetime: '2021-02-09T01:17:57.518405608Z',
        lastUsedChannelId: 'f457361cf59348129ca387a52d4d7fe2',
        messages: {
          totalCount: 0,
          href: 'https://whatsapp-sandbox.messagebird.com//v1/conversations/7b2223447c3441e7961aab583ebe8d14/messages'
        }
      }
    }
  end

  def data_for(id:, sender:, recipient:, message_id: nil, message_data: { 'text' => 'pokk' })
    {
      message: {
        id: message_id,
        conversationId: '7b2223447c3441e7961aab583ebe8d14',
        platform: 'whatsapp',
        to: recipient,
        from: sender,
        channelId: 'f457361cf59348129ca387a52d4d7fe2',
        type: 'text',
        content: message_data,
        direction: 'received',
        status: 'received',
        createdDatetime: '2021-02-09T01:17:57Z',
        updatedDatetime: '2021-02-09T01:17:57.527914771Z'
      },
      type: 'message.created',
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'message_bird',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }.merge(contact).merge(conversation)
  end

  def data_for_media(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      message: {
        id: message_id,
        conversationId: '7b2223447c3441e7961aab583ebe8d14',
        platform: 'whatsapp',
        to: recipient,
        from: sender,
        channelId: 'f457361cf59348129ca387a52d4d7fe2',
        type: 'image',
        content: {
          image: {
            url: 'https://media.messagebird.com/v1/media/ab397184-a03a-42de-a2c7-69abc4a0ceaa',
            caption: 'jij'
          }
        },
        direction: 'received',
        status: 'received',
        createdDatetime: '2021-02-09T01:22:59Z',
        updatedDatetime: '2021-02-09T01:23:01.353236248Z'
      },
      type: 'message.created',
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'message_bird',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }.merge(contact).merge(conversation)
  end

  def data_for_audio(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      message: {
        id: message_id,
        conversationId: '7b2223447c3441e7961aab583ebe8d14',
        platform: 'whatsapp',
        to: recipient,
        from: sender,
        channelId: 'f457361cf59348129ca387a52d4d7fe2',
        type: 'audio',
        content: {
          audio: {
            url: 'https://media.messagebird.com/v1/media/fa1ca4d6-5aa6-4379-a6ef-8d6ecbeb2617'
          }
        },
        direction: 'received',
        status: 'received',
        createdDatetime: '2021-02-09T01:22:59Z',
        updatedDatetime: '2021-02-09T01:23:01.353236248Z'
      },
      type: 'message.created',
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'message_bird',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }.merge(contact).merge(conversation)
  end

  def data_for_video(id:, sender:, recipient:, message_id: nil, message_data: {})
    {
      message: {
        id: message_id,
        conversationId: '7b2223447c3441e7961aab583ebe8d14',
        platform: 'whatsapp',
        to: recipient,
        from: sender,
        channelId: 'f457361cf59348129ca387a52d4d7fe2',
        type: 'video',
        content: {
          video: {
            url: 'https://media.messagebird.com/v1/media/2566f6eb-aa00-47fd-9608-604e08bb537d',
            caption: 'hello'
          }
        },
        direction: 'received',
        status: 'received',
        createdDatetime: '2021-02-09T01:17:57Z',
        updatedDatetime: '2021-02-09T01:17:57.527914771Z'
      },
      type: 'message.created',
      'controller' => 'api/v1/hooks/provider',
      'action' => 'process_event',
      'provider' => 'message_bird',
      'app_key' => app.key,
      'id' => @pkg.encoded_id
    }.merge(contact).merge(conversation)
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
      'provider' => 'message_bird',
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
    AppPackage.find_by(name: 'MessageBird')
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

      allow_any_instance_of(MessageApis::MessageBird::Api).to receive(
        :direct_upload
      ).and_return({url: '/direct-upload-mock'})
    end

    it 'receive conversation data' do
      re = get(:process_event,
               params: data_for(
                 id: @pkg.id,
                 sender: owner_phone,
                 recipient: user_phone,
                 message_id: '1234'
               ))

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

    it 'reply from agent on message_bird' do
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
