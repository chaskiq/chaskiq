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

  before :each do 
    Mutations::BaseMutation.any_instance
    .stub(:current_user)
    .and_return(agent_role.agent)

    allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(agent_role.agent)
  end

  describe 'apps' do
    it "list apps for logged user" do
      graphql_post(type: 'APPS', variables: {})
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.apps).to be_any
    end
  end

  describe 'app' do
    it "return app" do
      graphql_post(type: 'APP', variables: {appKey: app.key})
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app).to be_present
      expect(graphql_response.data.app.key).to_not be_empty
    end
  end


  describe 'app queries' do


    let(:predicates) { [{
        type: "role", 
        attribute: "role", 
        comparison: "eq", 
        value: "user_role"
      }]
    }

    it "agents" do
      #controller.stub(:current_user).and_return(agent_role.agent)
      graphql_post(type: 'AGENTS', variables: {appKey: app.key})
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app).to be_present
      expect(graphql_response.data.app.agents).to be_any
    end

    it "segments" do

      app.segments.create(predicates: predicates)

      #controller.stub(:current_user).and_return(agent_role.agent)
      graphql_post(type: 'SEGMENT', variables: {
        appKey: app.key, 
        id: app.segments.first.id
      })
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app).to be_present
      expect(graphql_response.data.app.segment).to be_present
      expect(graphql_response.data.app.segment.predicates).to be_any
    end


    it "campaigns" do

      expect(campaign.name).to be_present

      graphql_post(type: 'CAMPAIGNS', variables: {
        appKey: app.key, 
        mode: 'campaigns'
      })

      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app.campaigns.meta).to be_present
      expect(graphql_response.data.app.campaigns.collection).to be_any
    end

    it "campaign" do

      expect(campaign.name).to be_present

      graphql_post(type: 'CAMPAIGN', variables: {
        appKey: app.key, 
        mode: 'campaigns',
        id: campaign.id
      })

      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app.campaign.name).to be_present
    end


    describe "mutations on app" do

      it "create app" do

        expect(campaign.name).to be_present

        graphql_post(type: 'CREATE_APP', variables: {
          appParams: {
            name: "my app"
          },
          operation: 'create'
        })

        expect(graphql_response.errors).to be_nil
        expect(graphql_response.data.appsCreate.app).to_not be_blank
        expect(graphql_response.data.appsCreate.app.key).to be_present

      end

      it "update app" do

        expect(campaign.name).to be_present

        new_name = "my app edited"

        graphql_post(type: 'UPDATE_APP', variables: {
          appKey: app.key,
          appParams: {
            name: new_name
          }
        })

        expect(graphql_response.errors).to be_nil
        expect(graphql_response.data.appsUpdate.app.name).to be_eql new_name
      end

      it "destroy app" do
        pending("not implemented")
        graphql_post(type: 'DESTROY_APP', variables: {
          appKey: app.key
        })

        expect(graphql_response.error).to be_blank
        expect(graphql_response.errors).to be_present
      end
    end

  end


  describe 'invite agent' do
    it "return app" do
      graphql_post(type: 'INVITE_AGENT', variables: {
        appKey: app.key,
        email: "aa@aa.cl"
      })

      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.inviteAgent.agent.email).to be_present
      expect(app.agents.count).to be == 2
    end
  end




end