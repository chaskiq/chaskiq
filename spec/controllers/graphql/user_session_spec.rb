require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do

  let!(:app){
    FactoryGirl.create(:app)
  }

  let!(:user){
    app.add_user({email: "test@test.cl"})
  }

  let!(:agent_role){
    app.add_agent({email: "test2@test.cl"})
  }

  describe 'current_user' do
    it "return current user" do
      allow_any_instance_of(GraphqlController).to receive(:authorize_by_jwt).and_return(agent_role.agent)
      controller.instance_variable_set(:@current_agent, agent_role.agent ) 
      allow_any_instance_of(Types::BaseObject).to \
        receive(:current_agent).and_return(agent_role.agent)

      graphql_post(type: 'CURRENT_USER', variables: {})
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.userSession.email).to be_present
    end
  end
end