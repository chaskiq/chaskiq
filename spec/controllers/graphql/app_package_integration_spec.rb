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
    app.add_agent(
      {email: 'test2@test.cl'}, 
      bot: nil, 
      role_attrs: {access_list: ['manage']}
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

  let(:app_package) do
    AppPackage.find_by(name: 'Slack')
  end

  context 'privileged' do

    before :each do
      stub_current_user(agent_role)
    end

    describe 'add package' do
      it 'return app' do
        expect{
          graphql_post(type: 'CREATE_INTEGRATION', variables: {
                       appKey: app.key,
                       appPackage: app_package.name,
                       params: {
                         api_secret: '123455',
                         api_key: 'asd'
                       }
                     })
                    }.to change{app.app_package_integrations.count}.by(1)

        expect(graphql_response.errors).to be_nil
      end
  
      it 'unprivileged' do
        #unprivileged_agent_role
      end
    end
  
    describe 'add package with errors' do
      it 'return app' do
        app_package.update(definitions: [
          {
            name: 'api_key',
            label: 'App ID',
            type: 'string'
          },
          {
            name: 'api_secret',
            label: 'Client Secret',
            type: 'string'
          }
        ])
        expect{
          graphql_post(type: 'CREATE_INTEGRATION', variables: {
            appKey: app.key,
            appPackage: app_package.name,
            params: {
             api_key: 'asd'
           }
          })
        }.to_not change{app.app_package_integrations.count}

        expect(graphql_response.errors).to be_nil
        expect(graphql_response.data.integrationsCreate.errors.api_secret).to be_present
      end
    end
  
    describe 'update package' do
      before :each do
        graphql_post(type: 'CREATE_INTEGRATION', variables: {
                       appKey: app.key,
                       appPackage: app_package.name,
                       params: {
                        api_secret: '123455',
                        api_key: 'asd'
                       }
                     })
      end
  
      it 'created in app' do
        graphql_post(type: 'UPDATE_INTEGRATION', variables: {
                       appKey: app.key,
                       id: app.app_package_integrations.first.id,
                       params: {
                        api_secret: '123455',
                        api_key: 'asd'
                       }
                     })
        expect(graphql_response.data.integrationsUpdate.integration.name).to be_present
        expect(graphql_response.data.integrationsUpdate.integration.id).to be_present
        expect(graphql_response.data.integrationsUpdate.integration.settings).to be_present
      end
  
      it 'delete in app' do
        expect{graphql_post(type: 'DELETE_INTEGRATION', variables: {
                       appKey: app.key,
                       id: app.app_package_integrations.first.id
                     })
                    }.to change{app.app_package_integrations}.by([])
  
        expect(graphql_response.data.integrationsDelete.integration.name).to be_present
        expect(graphql_response.data.integrationsDelete.integration.id).to be_present
      end
    end
  
    describe 'queries app_packages' do
      it 'will return list of app packages' do
        app_package
        graphql_post(type: 'APP_PACKAGES', variables: {
                       appKey: app.key
                     })
        expect(graphql_response.data.app.appPackages).to be_present
      end
    end

  end

  context 'unprivileged' do
    before :each do
      stub_current_user(unprivileged_agent_role)
    end

    describe 'add package' do
      it 'return app' do

        expect{
          graphql_post(type: 'CREATE_INTEGRATION', variables: {
                       appKey: app.key,
                       appPackage: app_package.name,
                       params: {
                        api_secret: '123455',
                        api_key: 'asd'
                       }
                     })
        }.to_not change{app.app_package_integrations.count}
        expect(graphql_response.errors).to be_present
      end
    end

    describe 'update package' do
      before :each do
        app.app_package_integrations.create(
          app_package: app_package,
          api_secret: '123455',
          api_key: 'asd'
        )
      end
  
      it 'created in app' do
        graphql_post(type: 'UPDATE_INTEGRATION', variables: {
                       appKey: app.key,
                       id: app.app_package_integrations.first.id,
                       params: {
                         api_key: '123455',
                         api_secret: '123455'
                       }
                     })
  
        expect(graphql_response.errors).to be_present
      end
  
      it 'delete in app' do
        graphql_post(type: 'DELETE_INTEGRATION', variables: {
                       appKey: app.key,
                       id: app.app_package_integrations.first.id
                     })
  
        expect(graphql_response.errors).to be_present
      end
    end
  
    describe 'queries app_packages' do
      it 'will return list of app packages' do
        pending('dont know about this')
        app_package
  
        graphql_post(type: 'APP_PACKAGES', variables: {
                       appKey: app.key
                     })
        expect(graphql_response.errors).to be_blank
      end
    end
  end
end
