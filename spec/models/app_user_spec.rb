# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppUser, type: :model do
  include ActiveJob::TestHelper

  let(:app) { FactoryBot.create :app }
  let(:app_user) do
    app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
  end

  let(:visitor) do
    app.add_anonymous_user({})
  end

  it 'has events on created' do
    expect(app_user.events).to_not be_empty
    expect(app_user.events.first.action).to be == Event.action_for(:user_created)
  end

  describe 'full contact enrichment' do
    it 'send to enrichment' do
      App.any_instance.stub(:gather_social_data).and_return(true)
      visitor
      expect(app.app_users.count).to be == 1
      # expect(DataEnrichmentJob).to receive(:perform_later)
      perform_enqueued_jobs do
        visitor.update(email: 'miguelmichelson@gmail.com')
      end
    end

    it 'not send on setting false' do
      App.any_instance.stub(:gather_social_data).and_return(false)
      visitor
      expect(app.app_users.count).to be == 1
      expect(DataEnrichmentJob).to_not receive(:perform_later)
      visitor.update(email: 'miguelmichelson@gmail.com')
    end

    it 'run run' do
      app_package = AppPackage.create(
        name: 'FullContact',
        tag_list: ['enrichment'],
        description: 'Data Enrichment service',
        icon: 'https://logo.clearbit.com/fullcontact.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          }
        ]
      )

      app.app_package_integrations.create(
        app_package: app_package,
        api_secret: '12345'
      )

      App.any_instance.stub(:gather_social_data).and_return(true)
      visitor
      expect(app.app_users.count).to be == 1

      DataEnrichmentService::FullContact.any_instance.should_receive(:enrich_user)

      perform_enqueued_jobs do
        visitor.update(email: 'miguelmichelson@gmail.com')
      end
    end
  end

  describe 'visitor become lead' do
    before :each do
      expect(visitor).to be_a(Visitor)
      app.start_conversation(
        message: { text_content: 'aa' },
        from: visitor
      )
    end

    it 'when start conversation' do
      expect(visitor.type).to be == 'Lead'
    end
  end

  describe 'verify lead (convert to AppUser)' do
    it 'verify will convert lead to app user' do
      visitor.become_lead!
      app.app_users.leads.first.verify!
      expect(app.app_users.find(visitor.id).type).to be == 'AppUser'
    end

    context 'verify will clone lead to app user' do
      before :each do
        email = 'a@a.cl'
        app_user.update(email: email, country: 'chile', session_id: '123')
        visitor.update(email: email, country: 'peru', session_id: '000')
      end

      it 'will dispatch session event' do
        visitor.become_lead!
        app.app_users.leads.first.verify!
        expect(Event.last.action).to be == 'leads.verified'
      end

      it 'lead attrs have greather procedence ' do
        visitor.become_lead!
        app.app_users.leads.first.verify!
        expect(app_user.reload.country).to be == 'peru'
      end

      it 'greather procedence but session_id will be deployed' do
        visitor.become_lead!
        app.app_users.leads.first.verify!
        expect(app_user.reload.session_id).to be == '123'
      end

      it 'verify will copy lead conversations to app user' do
        expect(app_user.conversations).to be_blank
        app.start_conversation(
          message: { text_content: 'aa' },
          from: visitor
        )

        visitor.become_lead!
        app.app_users.leads.first.verify!

        app.app_users.where(type: 'AppUser')

        expect(app_user.reload.conversations).to be_any

        # for now we will keep lead record
        # expect(app.app_users.where(email: email).count).to be == 1
      end
    end
  end
end
