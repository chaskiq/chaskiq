require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  def blocks
    {
      type: 'app_package',
      schema: [
        {
          name: 'calendly',
          type: 'button',
          label: 'book a metting',
          element: 'button',
          placeholder: 'click button to open calendar'
        }
      ],
      values: {
        src: 'https://calendly.com/miguelmichelson/15min'
      },
      app_package: 'calendly',
      wait_for_input: true
    }
  end

  def data_for(id:, app:)
    # sent on created

    { 'event' => 'invitee.created',
      'time' => '2020-02-15T17:02:15Z',
      'payload' => {
        'event_type' => { 'uuid' => 'HGDMF2R22PJR3PDE',
                          'kind' => 'One-on-One',
                          'slug' => '15min', 'name' => 'Reunión de 15 minutos',
                          'duration' => 15,
                          'owner' => { 'type' => 'users', 'uuid' => 'FAAEB4J2LYURPSXK' } },
        'event' => {
          'uuid' => 'HEMOUUUABDTCBBPU',
          'assigned_to' => ['Miguel Michelsongs'],
          'extended_assigned_to' => [
            { 'name' => 'Miguel Michelsongs',
              'email' => 'miguelmichelson@gmail.com',
              'primary' => true }
          ],
          'start_time' => '2020-02-21T09:00:00-03:00',
          'start_time_pretty' => '09:00am - Friday, February 21, 2020',
          'invitee_start_time' => '2020-02-21T09:00:00-03:00',
          'invitee_start_time_pretty' => '09:00am - Friday, February 21, 2020',
          'end_time' => '2020-02-21T09:15:00-03:00',
          'end_time_pretty' => '09:15am - Friday, February 21, 2020',
          'invitee_end_time' => '2020-02-21T09:15:00-03:00',
          'invitee_end_time_pretty' => '09:15am - Friday, February 21, 2020',
          'created_at' => '2020-02-15T14:02:14-03:00',
          'location' => nil,
          'canceled' => false,
          'canceler_name' => nil,
          'cancel_reason' => nil,
          'canceled_at' => nil
        },
        'invitee' => {
          'uuid' => 'EDLQEWAGIUJJ6BMP', 'first_name' => nil,
          'last_name' => nil, 'name' => 'miguel michelson m',
          'email' => 'miguelmichelson@gmail.com',
          'text_reminder_number' => nil,
          'timezone' => 'America/Santiago',
          'created_at' => '2020-02-15T14:02:14-03:00',
          'is_reschedule' => false, 'payments' => [],
          'canceled' => false, 'canceler_name' => nil,
          'cancel_reason' => nil, 'canceled_at' => nil
        },
        'questions_and_answers' => [],
        'questions_and_responses' => {},
        'tracking' => {
          'utm_campaign' => 'Conversation',
          'utm_source' => conversation.key,
          'utm_medium' => 'ConversationMessage',
          'utm_content' => message.id.to_s,
          'utm_term' => 'Chaskiq',
          'salesforce_uuid' => nil
        },
        'old_event' => nil,
        'old_invitee' => nil,
        'new_event' => nil,
        'new_invitee' => nil
      },
      # "app_key"=> app.key,
      # "provider"=>"calendly",
      'id' => id.to_s }
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
    AppPackage.find_by(name: 'Calendly')
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
    before do
      AppPackagesCatalog.update_all
    end

    before :each do
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false

      conversation

      AppPackageIntegration.any_instance
                           .stub(:handle_registration)
                           .and_return({})

      @pkg = app.app_package_integrations.create(
        api_secret: 'aaa',
        app_package: app_package
      )
    end

    it 'will trigger crm registration' do
      visitor
    end

    it 'receive hook' do
      allow_any_instance_of(MessageApis::Calendly::Api).to receive(:enqueue_process_event).once
      post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
    end

    it 'receive invitee' do
      perform_enqueued_jobs do
        post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
        expect(message.reload.message.data).to be_present
      end
    end
  end
end
