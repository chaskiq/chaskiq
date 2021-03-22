require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  def block_actions(id:, message_data: {}, conversation: nil)
    payload = {
    }

    {
      'payload' => payload.to_json,
      # "app_key"=> app.key,
      # "provider"=>"pipedrive",
      'id' => id
    }
  end

  def data_for(id:, app:)
    # sent on created
    data = {
      'v' => 1,
      'matches_filters' => { 'current' => [] },
      'meta' => { 'v' => 1, 'action' => 'updated', 'object' => 'person', 'id' => 11, 'company_id' => 7_468_915, 'user_id' => 11_379_745, 'host' => 'michelson.pipedrive.com', 'timestamp' => 1_581_613_434, 'timestamp_micro' => 1_581_613_434_223_943, 'permitted_user_ids' => [11_379_745], 'trans_pending' => false, 'is_bulk_update' => false, 'pipedrive_service_name' => false, 'matches_filters' => { 'current' => [] }, 'webhook_id' => '136435' },
      'current' => { 'id' => 11, 'company_id' => 7_468_915, 'owner_id' => 11_379_745, 'org_id' => nil, 'name' => 'test users', 'first_name' => 'test', 'last_name' => 'users', 'open_deals_count' => 0, 'related_open_deals_count' => 0, 'closed_deals_count' => 0, 'related_closed_deals_count' => 0, 'participant_open_deals_count' => 0, 'participant_closed_deals_count' => 0, 'email_messages_count' => 0, 'activities_count' => 0, 'done_activities_count' => 0, 'undone_activities_count' => 0, 'reference_activities_count' => 0, 'files_count' => 0, 'notes_count' => 0, 'followers_count' => 1, 'won_deals_count' => 0, 'related_won_deals_count' => 0, 'lost_deals_count' => 0, 'related_lost_deals_count' => 0, 'active_flag' => true, 'phone' => [{ 'value' => '', 'primary' => true }], 'email' => [{ 'label' => 'work', 'value' => 'aa@aa.cl', 'primary' => true }], 'first_char' => 't', 'update_time' => '2020-02-13 17:03:54', 'add_time' => '2020-02-13 17:03:53', 'visible_to' => '3', 'google_contact_id' => nil, 'picture_id' => nil, 'next_activity_date' => nil, 'next_activity_time' => nil, 'next_activity_id' => nil, 'last_activity_id' => nil, 'last_activity_date' => nil, 'last_incoming_mail_time' => nil, 'last_outgoing_mail_time' => nil, 'label' => nil, 'org_name' => nil, 'cc_email' => 'michelson@pipedrivemail.com', 'owner_name' => 'miguel' }, 'previous' => { 'id' => 11, 'company_id' => 7_468_915, 'owner_id' => 11_379_745, 'org_id' => nil, 'name' => 'test users', 'first_name' => 'test', 'last_name' => 'users', 'open_deals_count' => 0, 'related_open_deals_count' => 0, 'closed_deals_count' => 0, 'related_closed_deals_count' => 0, 'participant_open_deals_count' => 0, 'participant_closed_deals_count' => 0, 'email_messages_count' => 0, 'activities_count' => 0, 'done_activities_count' => 0, 'undone_activities_count' => 0, 'reference_activities_count' => 0, 'files_count' => 0, 'notes_count' => 0, 'followers_count' => 0, 'won_deals_count' => 0, 'related_won_deals_count' => 0, 'lost_deals_count' => 0, 'related_lost_deals_count' => 0, 'active_flag' => true, 'phone' => [{ 'value' => '', 'primary' => true }], 'email' => [{ 'label' => 'work', 'value' => 'aa@aa.cl', 'primary' => true }], 'first_char' => 't', 'update_time' => '2020-02-13 17:03:53', 'add_time' => '2020-02-13 17:03:53', 'visible_to' => '3', 'google_contact_id' => nil, 'picture_id' => nil, 'next_activity_date' => nil, 'next_activity_time' => nil, 'next_activity_id' => nil, 'last_activity_id' => nil, 'last_activity_date' => nil, 'last_incoming_mail_time' => nil, 'last_outgoing_mail_time' => nil, 'label' => nil, 'org_name' => nil, 'cc_email' => 'michelson@pipedrivemail.com', 'owner_name' => 'miguel' },
      'event' => 'updated.person',
      'retry' => 0,
      # "app_key"=>app.key,
      # "provider"=>"pipedrive",
      'id' => id
    }
  end

  def update_data_for(id:, app:, profile_id:)
    {
      'v' => 1,
      'matches_filters' => { 'current' => [] },
      'meta' => {
        'v' => 1,
        'action' => 'updated',
        'object' => 'person',
        'id' => profile_id,
        'webhook_id' => '136435'
      },
      'current' => { 'id' => profile_id, 'company_id' => 7_468_915, 'owner_id' => 11_379_745, 'org_id' => nil, 'name' => 'test userspopokpok', 'first_name' => 'test', 'last_name' => 'userspopokpok', 'open_deals_count' => 0, 'related_open_deals_count' => 0, 'closed_deals_count' => 0, 'related_closed_deals_count' => 0, 'participant_open_deals_count' => 0, 'participant_closed_deals_count' => 0, 'email_messages_count' => 0, 'activities_count' => 0, 'done_activities_count' => 0, 'undone_activities_count' => 0, 'reference_activities_count' => 0, 'files_count' => 0, 'notes_count' => 0, 'followers_count' => 1, 'won_deals_count' => 0, 'related_won_deals_count' => 0, 'lost_deals_count' => 0, 'related_lost_deals_count' => 0, 'active_flag' => true, 'phone' => [{ 'value' => '', 'primary' => true }], 'email' => [{ 'label' => 'work', 'value' => 'aa@aa.cl', 'primary' => true }], 'first_char' => 't', 'update_time' => '2020-02-13 18:16:56', 'add_time' => '2020-02-13 17:03:53', 'visible_to' => '3', 'google_contact_id' => nil, 'picture_id' => nil, 'next_activity_date' => nil, 'next_activity_time' => nil, 'next_activity_id' => nil, 'last_activity_id' => nil, 'last_activity_date' => nil, 'last_incoming_mail_time' => nil, 'last_outgoing_mail_time' => nil, 'label' => nil, 'org_name' => nil, 'cc_email' => 'michelson@pipedrivemail.com' },
      'previous' => { 'id' => profile_id, 'company_id' => 7_468_915, 'owner_id' => 11_379_745, 'org_id' => nil, 'name' => 'test users', 'first_name' => 'test', 'last_name' => 'users', 'open_deals_count' => 0, 'related_open_deals_count' => 0, 'closed_deals_count' => 0, 'related_closed_deals_count' => 0, 'participant_open_deals_count' => 0, 'participant_closed_deals_count' => 0, 'email_messages_count' => 0, 'activities_count' => 0, 'done_activities_count' => 0, 'undone_activities_count' => 0, 'reference_activities_count' => 0, 'files_count' => 0, 'notes_count' => 0, 'followers_count' => 1, 'won_deals_count' => 0, 'related_won_deals_count' => 0, 'lost_deals_count' => 0, 'related_lost_deals_count' => 0, 'active_flag' => true, 'phone' => [{ 'value' => '', 'primary' => true }], 'email' => [{ 'label' => 'work', 'value' => 'aa@aa.cl', 'primary' => true }], 'first_char' => 't', 'update_time' => '2020-02-13 17:03:54', 'add_time' => '2020-02-13 17:03:53', 'visible_to' => '3', 'google_contact_id' => nil, 'picture_id' => nil, 'next_activity_date' => nil, 'next_activity_time' => nil, 'next_activity_id' => nil, 'last_activity_id' => nil, 'last_activity_date' => nil, 'last_incoming_mail_time' => nil, 'last_outgoing_mail_time' => nil, 'label' => nil, 'org_name' => nil, 'cc_email' => 'michelson@pipedrivemail.com' },
      'event' => 'updated.person',
      'retry' => 0,
      # "app_key"=> app.key,
      # "provider"=>"pipedrive",
      'id' => id
    }
  end

  def delete_data_for(id:, app:)
    {
      'v' => 1, 'matches_filters' => { 'current' => [] },
      'meta' => { 'v' => 1, 'action' => 'deleted', 'object' => 'person', 'id' => 1, 'company_id' => 7_468_915, 'user_id' => 11_379_745, 'host' => 'michelson.pipedrive.com', 'timestamp' => 1_581_526_245, 'timestamp_micro' => 1_581_526_245_472_542, 'permitted_user_ids' => [11_379_745], 'trans_pending' => false, 'is_bulk_update' => false, 'pipedrive_service_name' => false, 'matches_filters' => { 'current' => [] }, 'webhook_id' => '136435' },
      'current' => nil,
      'previous' => { 'id' => 1, 'company_id' => 7_468_915, 'owner_id' => 11_379_745, 'org_id' => nil, 'name' => 'Chaskiq editado 22oijoij oijijoijojoi', 'first_name' => 'Chaskiq editado 22oijoij', 'last_name' => 'oijijoijojoi', 'open_deals_count' => 0, 'related_open_deals_count' => 0, 'closed_deals_count' => 0, 'related_closed_deals_count' => 0, 'participant_open_deals_count' => 0, 'participant_closed_deals_count' => 0, 'email_messages_count' => 0, 'activities_count' => 0, 'done_activities_count' => 0, 'undone_activities_count' => 0, 'reference_activities_count' => 0, 'files_count' => 0, 'notes_count' => 0, 'followers_count' => 1, 'won_deals_count' => 0, 'related_won_deals_count' => 0, 'lost_deals_count' => 0, 'related_lost_deals_count' => 0, 'active_flag' => true, 'phone' => [{ 'label' => 'work', 'value' => '0992302305', 'primary' => true }], 'email' => [{ 'value' => '', 'primary' => true }], 'first_char' => 'c', 'update_time' => '2020-02-12 05:50:32', 'add_time' => '2020-02-12 02:27:09', 'visible_to' => '3', 'google_contact_id' => nil, 'picture_id' => nil, 'sync_needed' => false, 'next_activity_date' => nil, 'next_activity_time' => nil, 'next_activity_id' => nil, 'last_activity_id' => nil, 'last_activity_date' => nil, 'last_incoming_mail_time' => nil, 'last_outgoing_mail_time' => nil, 'label' => nil, 'service_reference' => '[]', 'org_name' => nil, 'cc_email' => 'michelson@pipedrivemail.com' },
      'event' => 'deleted.person',
      'retry' => 0,
      # "app_key"=> app.key,
      # "provider"=>"pipedrive",
      'id' => id
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
    AppPackage.find_by(name: 'Pipedrive')
  end

  let(:conversation) do
    app.start_conversation(
      message: { html_content: 'message' },
      from: user
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

    it 'receive contact' do
      allow_any_instance_of(MessageApis::Pipedrive).to receive(:enqueue_process_event).once
      post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
    end

    it 'receive contact' do
      allow_any_instance_of(MessageApis::Pipedrive).to receive(:process_event).once

      expect do
        post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
      end.to_not change { AppUser.count } # .by(1)
    end

    it 'update profile' do
      allow_any_instance_of(MessageApis::Pipedrive).to receive(:update_app_user_profile).once
      post(:process_event, params: data_for(id: @pkg.encoded_id, app: app))
    end

    it 'delete profile' do
      allow_any_instance_of(MessageApis::Pipedrive).to receive(:delete_app_user_profile).once
      post(:process_event, params: delete_data_for(id: @pkg.encoded_id, app: app))
    end

    describe 'with external_profile' do
      before :each do
        user.external_profiles.create(profile_id: 1, provider: 'pipedrive')
      end
      it 'will destroy profile' do
        expect do
          post(:process_event, params: delete_data_for(id: @pkg.encoded_id, app: app))
        end.to change { ExternalProfile.count }
      end

      it 'will update profile' do
        post(:process_event, params: update_data_for(id: @pkg.encoded_id, app: app, profile_id: 1))
        expect(user.external_profiles.first.data).to be_present
        user.reload
        expect(user.first_name).to be_present
        expect(user.last_name).to be_present
      end
    end

    describe 'model' do
      it 'visitor converted' do
        perform_enqueued_jobs do
          allow_any_instance_of(MessageApis::Pipedrive).to receive(:trigger).once
          visitor.update(email: 'aaa@aa.cl')
        end
      end

      # success response
      # "{\"success\":true,\"data\":{\"id\":1,\"company_id\":7468915,\"owner_id\":{\"id\":11379745,\"name\":\"miguel\",\"email\":\"miguelmichelson@gmail.com\",\"has_pic\":true,\"pic_hash\":\"0e3becb525c2be58ab427d3e269d2c83\",\"active_flag\":true,\"value\":11379745},\"org_id\":null,\"name\":\"migue\",\"first_name\":\"migue\",\"last_name\":\"\",\"open_deals_count\":0,\"related_open_deals_count\":0,\"closed_deals_count\":0,\"related_closed_deals_count\":0,\"participant_open_deals_count\":0,\"participant_closed_deals_count\":0,\"email_messages_count\":0,\"activities_count\":0,\"done_activities_count\":0,\"undone_activities_count\":0,\"reference_activities_count\":0,\"files_count\":0,\"notes_count\":0,\"followers_count\":1,\"won_deals_count\":0,\"related_won_deals_count\":0,\"lost_deals_count\":0,\"related_lost_deals_count\":0,\"active_flag\":true,\"phone\":[{\"label\":\"\",\"value\":\"0992302305\",\"primary\":true}],\"email\":[{\"label\":\"\",\"value\":\"miguejoijolmichelson@gmail.com\",\"primary\":true}],\"first_char\":\"m\",\"update_time\":\"2020-02-12 02:42:18\",\"add_time\":\"2020-02-12 02:27:09\",\"visible_to\":\"3\",\"picture_id\":null,\"next_activity_date\":null,\"next_activity_time\":null,\"next_activity_id\":null,\"last_activity_id\":null,\"last_activity_date\":null,\"last_incoming_mail_time\":null,\"last_outgoing_mail_time\":null,\"label\":null,\"org_name\":null,\"cc_email\":\"michelson@pipedrivemail.com\"},\"related_objects\":{\"user\":{\"11379745\":{\"id\":11379745,\"name\":\"miguel\",\"email\":\"miguelmichelson@gmail.com\",\"has_pic\":true,\"pic_hash\":\"0e3becb525c2be58ab427d3e269d2c83\",\"active_flag\":true}}}}"

      # error response
      # "{\"success\":false,\"error\":\"Person not found\",\"error_info\":\"Consulta developers.pipedrive.com para obtener m\\u00e1s informaci\\u00f3n sobre el API de Pipedrive.\",\"data\":null,\"additional_data\":null}"

      it 'visitor converted' do
        success = '{"success":true,"data":{"id":1,"company_id":7468915,"owner_id":{"id":11379745,"name":"miguel","email":"miguelmichelson@gmail.com","has_pic":true,"pic_hash":"0e3becb525c2be58ab427d3e269d2c83","active_flag":true,"value":11379745},"org_id":null,"name":"migue","first_name":"migue","last_name":"","open_deals_count":0,"related_open_deals_count":0,"closed_deals_count":0,"related_closed_deals_count":0,"participant_open_deals_count":0,"participant_closed_deals_count":0,"email_messages_count":0,"activities_count":0,"done_activities_count":0,"undone_activities_count":0,"reference_activities_count":0,"files_count":0,"notes_count":0,"followers_count":1,"won_deals_count":0,"related_won_deals_count":0,"lost_deals_count":0,"related_lost_deals_count":0,"active_flag":true,"phone":[{"label":"","value":"0992302305","primary":true}],"email":[{"label":"","value":"miguejoijolmichelson@gmail.com","primary":true}],"first_char":"m","update_time":"2020-02-12 02:42:18","add_time":"2020-02-12 02:27:09","visible_to":"3","picture_id":null,"next_activity_date":null,"next_activity_time":null,"next_activity_id":null,"last_activity_id":null,"last_activity_date":null,"last_incoming_mail_time":null,"last_outgoing_mail_time":null,"label":null,"org_name":null,"cc_email":"michelson@pipedrivemail.com"},"related_objects":{"user":{"11379745":{"id":11379745,"name":"miguel","email":"miguelmichelson@gmail.com","has_pic":true,"pic_hash":"0e3becb525c2be58ab427d3e269d2c83","active_flag":true}}}}'

        MessageApis::Pipedrive::Api.any_instance
                                   .stub(:create_person)
                                   .and_return(JSON.parse(success))

        perform_enqueued_jobs do
          visitor.update(email: 'aaa@aa.cl')
          visitor.reload
          expect(visitor.external_profiles).to be_any
          expect(visitor.external_profiles.first.provider).to be == 'pipedrive'
          expect(visitor.external_profiles.first.profile_id).to be_present
          expect(visitor.external_profiles.first.data).to be_present
        end
      end

      it 'visitor converted' do
        success = '{"success":true,"data":{"id":1,"company_id":7468915,"owner_id":{"id":11379745,"name":"miguel","email":"miguelmichelson@gmail.com","has_pic":true,"pic_hash":"0e3becb525c2be58ab427d3e269d2c83","active_flag":true,"value":11379745},"org_id":null,"name":"migue","first_name":"migue","last_name":"","open_deals_count":0,"related_open_deals_count":0,"closed_deals_count":0,"related_closed_deals_count":0,"participant_open_deals_count":0,"participant_closed_deals_count":0,"email_messages_count":0,"activities_count":0,"done_activities_count":0,"undone_activities_count":0,"reference_activities_count":0,"files_count":0,"notes_count":0,"followers_count":1,"won_deals_count":0,"related_won_deals_count":0,"lost_deals_count":0,"related_lost_deals_count":0,"active_flag":true,"phone":[{"label":"","value":"0992302305","primary":true}],"email":[{"label":"","value":"miguejoijolmichelson@gmail.com","primary":true}],"first_char":"m","update_time":"2020-02-12 02:42:18","add_time":"2020-02-12 02:27:09","visible_to":"3","picture_id":null,"next_activity_date":null,"next_activity_time":null,"next_activity_id":null,"last_activity_id":null,"last_activity_date":null,"last_incoming_mail_time":null,"last_outgoing_mail_time":null,"label":null,"org_name":null,"cc_email":"michelson@pipedrivemail.com"},"related_objects":{"user":{"11379745":{"id":11379745,"name":"miguel","email":"miguelmichelson@gmail.com","has_pic":true,"pic_hash":"0e3becb525c2be58ab427d3e269d2c83","active_flag":true}}}}'

        visitor.external_profiles.create(provider: 'pipedrive', profile_id: 1)

        MessageApis::Pipedrive::Api.any_instance
                                   .stub(:create_person)
                                   .and_return(JSON.parse(success))

        perform_enqueued_jobs do
          visitor.update(email: 'aaa@aa.cl')
          visitor.reload
          expect(visitor.external_profiles.size).to be == 1
          expect(visitor.external_profiles.first.provider).to be == 'pipedrive'
          expect(visitor.external_profiles.first.profile_id).to be_present
          expect(visitor.external_profiles.first.data).to be_present
        end
      end
    end
  end
end
