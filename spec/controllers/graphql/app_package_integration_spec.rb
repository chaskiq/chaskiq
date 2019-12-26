# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do
  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: 'test@test.cl')
  end

  let!(:agent_role) do
    app.add_agent(email: 'test2@test.cl')
  end

  let(:app_package) do
    definitions = [{
      name: 'api_secret',
      type: 'string',
      grid: { xs: 12, sm: 12 }
    }]
    AppPackage.create(name: 'slack', definitions: definitions)
  end

  before :each do
    controller.stub(:current_user).and_return(agent_role.agent)
    allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(agent_role.agent)

    Mutations::BaseMutation.any_instance
                           .stub(:current_user)
                           .and_return(agent_role.agent)

    allow_any_instance_of(GraphqlController).to receive(:doorkeeper_authorize!).and_return(agent_role.agent)
    controller.instance_variable_set(:@current_agent, agent_role.agent)  
  end

  describe 'add package' do
    it 'return app' do
      graphql_post(type: 'CREATE_INTEGRATION', variables: {
                     appKey: app.key,
                     appPackage: app_package.name,
                     params: {
                       api_secret: '123455'
                     }
                   })
      expect(graphql_response.errors).to be_nil
      expect(app.app_package_integrations.count).to be == 1
    end
  end

  describe 'add package with errors' do
    it 'return app' do
      graphql_post(type: 'CREATE_INTEGRATION', variables: {
                     appKey: app.key,
                     appPackage: app_package.name,
                     params: {
                       api_key: '123455'
                     }
                   })

      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.integrationsCreate.errors.api_secret).to be_present
      expect(app.app_package_integrations.count).to be == 0
    end
  end

  describe 'update package' do
    before :each do
      graphql_post(type: 'CREATE_INTEGRATION', variables: {
                     appKey: app.key,
                     appPackage: app_package.name,
                     params: {
                       api_secret: '123455'
                     }
                   })
    end

    it 'created in app' do
      graphql_post(type: 'UPDATE_INTEGRATION', variables: {
                     appKey: app.key,
                     id: app.app_package_integrations.first.id,
                     params: {
                       api_key: '123455'
                     }
                   })

      expect(graphql_response.data.integrationsUpdate.integration.name).to be_present
      expect(graphql_response.data.integrationsUpdate.integration.id).to be_present
      expect(graphql_response.data.integrationsUpdate.integration.settings).to be_present
    end

    it 'delete in app' do
      graphql_post(type: 'DELETE_INTEGRATION', variables: {
                     appKey: app.key,
                     id: app.app_package_integrations.first.id
                   })

      expect(graphql_response.data.integrationsDelete.integration.name).to be_present
      expect(graphql_response.data.integrationsDelete.integration.id).to be_present
      expect(app.app_package_integrations.size).to be == 0
    end
  end

  describe 'queries app_packages' do
    it 'will return list of app packages' do
      app_package

      graphql_post(type: 'APP_PACKAGES', variables: {
                     appKey: app.key
                   })

      expect(graphql_response.data.app.appPackages.size).to be == 1
    end
  end
end
