# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do
  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent(
      { email: 'test2@test.cl' },
      bot: nil,
      role_attrs: { access_list: ['manage'] }
    )
  end

  let!(:unprivileged_agent_role) do
    app.add_agent(
      {
        email: 'test3@test.cl',
        bot: nil
      }
    )
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    # ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    # Rails.application.config.active_job.queue_adapter = :test
  end

  describe 'privileged' do
    before :each do
      stub_current_user(agent_role)
    end

    it 'event types' do
      graphql_post(type: 'EVENT_TYPES', variables: {
                     appKey: app.key
                   })
      expect(graphql_response.data.app.eventTypes).to be_any
      expect(graphql_response.errors).to be_nil
    end

    describe 'mutations' do
      it 'create webhook' do
        graphql_post(type: 'WEBHOOK_CREATE',
                     variables: {
                       appKey: app.key,
                       url: 'http://test.com',
                       tags: ['aa'],
                       state: 'true'
                     })

        expect(graphql_response.data.createWebhook.webhook).to be_present
      end

      it 'update webhook' do
        webhook = app.outgoing_webhooks.create(
          url: 'http://google.com',
          tag_list: ['1']
        )

        url = 'http://test.com'
        tags = %w[bb cc]

        graphql_post(type: 'WEBHOOK_UPDATE',
                     variables: {
                       appKey: app.key,
                       id: webhook.id,
                       url: url,
                       tags: tags,
                       state: 'true'
                     })

        expect(graphql_response.data.updateWebhook.webhook).to be_present
        expect(graphql_response.data.updateWebhook.webhook.url).to be == url
        expect(graphql_response.data.updateWebhook.webhook.tag_list).to be == tags
      end

      it 'delete webhook' do
        webhook = app.outgoing_webhooks.create(
          url: 'http://google.com',
          tag_list: ['1']
        )

        graphql_post(type: 'WEBHOOK_DELETE',
                     variables: {
                       appKey: app.key,
                       id: webhook.id
                     })

        expect(graphql_response.data.deleteWebhook.webhook).to be_present
        expect(app.reload.outgoing_webhooks).to be_blank
      end
    end
  end

  describe 'unprivileged' do
    before :each do
      stub_current_user(unprivileged_agent_role)
    end

    describe 'mutations' do
      it 'create webhook' do
        graphql_post(type: 'WEBHOOK_CREATE',
                     variables: {
                       appKey: app.key,
                       url: 'http://test.com',
                       tags: ['aa'],
                       state: 'true'
                     })

        expect(graphql_response.errors).to be_present
      end

      it 'update webhook' do
        webhook = app.outgoing_webhooks.create(
          url: 'http://google.com',
          tag_list: ['1']
        )

        url = 'http://test.com'
        tags = %w[bb cc]

        graphql_post(type: 'WEBHOOK_UPDATE',
                     variables: {
                       appKey: app.key,
                       id: webhook.id,
                       url: url,
                       tags: tags,
                       state: 'true'
                     })

        expect(graphql_response.errors).to be_present
      end

      it 'delete webhook' do
        webhook = app.outgoing_webhooks.create(
          url: 'http://google.com',
          tag_list: ['1']
        )

        graphql_post(type: 'WEBHOOK_DELETE',
                     variables: {
                       appKey: app.key,
                       id: webhook.id
                     })

        expect(graphql_response.errors).to be_present
      end
    end
  end
end
