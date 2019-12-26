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

  describe 'current_user' do
    it 'return current user' do
      allow_any_instance_of(GraphqlController).to receive(:doorkeeper_authorize!).and_return(agent_role.agent)
      controller.instance_variable_set(:@current_agent, agent_role.agent)
      allow_any_instance_of(Types::BaseObject).to \
        receive(:current_agent).and_return(agent_role.agent)

      Types::QueryType.any_instance
        .stub(:current_user)
        .and_return(agent_role.agent)


      graphql_post(type: 'CURRENT_USER', variables: {})
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.userSession.email).to be_present
    end
  end
end
