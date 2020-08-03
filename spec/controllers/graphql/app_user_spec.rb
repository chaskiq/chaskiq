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

  before :each do
    stub_current_user(agent_role)
  end

  describe 'app_user' do
    it 'return current user' do
      graphql_post(type: 'APP_USER', variables: { appKey: app.key, id: user.id })
      
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app.appUser.email).to be_present
    end
  end
end
