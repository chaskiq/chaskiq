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
      controller.stub(:current_user).and_return(agent_role.agent)
      graphql_post(type: 'CURRENT_USER', variables: {})
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.userSession.email).to be_present
    end
  end
end