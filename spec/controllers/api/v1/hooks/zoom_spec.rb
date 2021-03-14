require 'rails_helper'
include ActiveJob::TestHelper
require 'app_packages_catalog'

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  def blocks
    {
      type: 'app_package',
      schema: [
        {
          type: 'button',
          align: 'left',
          label: 'Join',
          width: 'full',
          action: {
            type: 'url',
            url: 'http://something.cl'
          }
        }
      ],
      values: {
        src: nil
      },
      app_package: 'zoom',
      wait_for_input: true
    }
  end

  # "meeting.ended"
  def data_for(id:, app:, event: 'meeting.started')
    {
      'event' => event,
      'payload' => {
        'account_id' => 'kJcMqqYDTDO3gravE-7rrg',
        'object' => {
          'duration' => 20,
          'start_time' => '2020-03-21T06:27:45Z',
          'timezone' => 'America/Santiago',
          'topic' => message.key,
          'id' => '682222129',
          'type' => 1,
          'uuid' => 'y2LDN3XGS0GlRrlvY8Ue4A==',
          'host_id' => 'gakETMlISPCYrkeR6SlYHA'
        }
      },
      # "app_key"=> app.key,
      # "provider"=>"zoom",
      'id' => id.to_s
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:visitor) do
    app.add_anonymous_user({})
  end

  let!(:user) do
    app.add_user(email: 'test@test.cl')
  end

  let!(:agent_role) do
    app.add_agent({ email: 'test2@test.cl' })
  end

  let(:app_package) do
    AppPackage.find_by(name: 'Zoom')
  end

  let(:conversation) do
    app.start_conversation(
      message: { html_content: 'message' },
      from: user
    )
  end

  let(:message) do
    conversation.add_message(
      from: app.app_users.first,
      controls: blocks
    )
  end

  describe 'hooks' do
    before :each do
      AppPackagesCatalog.update_all
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false

      AppPackageIntegration.any_instance
                           .stub(:handle_registration)
                           .and_return({})

      MessageApis::Zoom::Api.any_instance
                       .stub(:create_fase)
                       .and_return({ definitions: blocks[:schema] })

      @pkg = app.app_package_integrations.create(
        api_secret: 'aaa',
        app_package: app_package,
        api_key: 'aaa',
        access_token: 'aaa'
      )

      message
    end

    it 'receive hook' do
      allow_any_instance_of(MessageApis::Zoom).to receive(:enqueue_process_event).once
      post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
    end

    it 'meeting started' do
      perform_enqueued_jobs do
        post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
        expect(message.reload.message.data['status']).to be == 'meeting_started'
      end
    end

    it 'meeting ended' do
      perform_enqueued_jobs do
        post(:process_event, params: data_for(id: @pkg.encoded_id, app: app, event: 'meeting.ended'))
        expect(message.reload.message.data['status']).to be == 'meeting_ended'
      end
    end
  end
end
