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

  let(:campaign){
    FactoryGirl.create(:campaign, app: app)
  }

  let(:valid_segments) {
    {
      data: {
        predicates: [{attribute: "last_visited_at", 
                      comparison: "gteq", 
                      type: "date", 
                      value: "1 days ago"
                    }.with_indifferent_access]        
      }

    }
  }

  let(:invalid_segments) {
    {
      data: {
        predicates: [{attributex: "last_visited_at", 
                      comparisonx: "gteq", 
                      typex: "date", 
                      valuex: "1 days ago"
                    }.with_indifferent_access]        
      }

    }
  }

  describe 'segments' do
    before :each do 
      Mutations::BaseMutation.any_instance
      .stub(:current_user)
      .and_return(agent_role.agent)
      # controller.stub(:current_user).and_return(agent_role.agent)
    end

    it "predicates search" do
      graphql_post(type: 'PREDICATES_SEARCH', variables: {
        appKey: app.key,
        page: 1,
        search: valid_segments
      })
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.predicatesSearch.appUsers.collection).to be_any
      expect(graphql_response.data.predicatesSearch.appUsers.meta).to be_present
    end

    it "predicates search invalid" do
      pending("error not implemented")

      graphql_post(type: 'PREDICATES_SEARCH', variables: {
        appKey: app.key,
        page: 1,
        search: invalid_segments
      })

      expect(graphql_response.errors).to_not be_present
      # instead maybe we should return erros on invalid predicates
      # expect(graphql_response.errors).to be_present
    end


    it "save segment" do
      pending("save segment")
      graphql_post(type: 'PREDICATES_UPDATE', variables: {
        appKey: app.key,
        page: 1,
        search: invalid_segments
      })

      expect(graphql_response.errors).to_not be_present
    end


    it "delete segment" do
      pending("delete segment")
      graphql_post(type: 'PREDICATES_DELETE', variables: {
        appKey: app.key,
        page: 1,
        search: invalid_segments
      })

      expect(graphql_response.errors).to_not be_present
    end


    it "create segment" do
      pending("create segment")
      graphql_post(type: 'PREDICATES_CREATE', variables: {
        appKey: app.key,
        page: 1,
        search: invalid_segments
      })

      expect(graphql_response.errors).to_not be_present
    end

  end

end