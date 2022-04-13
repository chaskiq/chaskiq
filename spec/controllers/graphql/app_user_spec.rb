# frozen_string_literal: true

require "rails_helper"

RSpec.describe GraphqlController, type: :controller do
  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: "test@test.cl")
  end

  let!(:agent_role) do
    app.add_agent(
      { email: "test2@test.cl" },
      bot: nil,
      role_attrs: { access_list: ["manage"], role: "admin" }
    )
  end

  before :each do
    stub_current_user(agent_role)
  end

  describe "app_user" do
    it "return current user" do
      graphql_post(type: "APP_USER", variables: { appKey: app.key, id: user.id.to_s })
      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.app.appUser.email).to be_present
    end

    it "external profile" do
      provider = "SOME_API"
      profile_id = "1234"

      graphql_post(
        type: "APP_USER_PROFILE_CREATE",
        variables: {
          appKey: app.key,
          userId: user.id.to_s,
          provider:,
          profileId: profile_id
        }
      )

      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.createExternalProfile.profile.provider).to be == provider
      expect(graphql_response.data.createExternalProfile.profile.profileId).to be == profile_id

      graphql_post(
        type: "APP_USER_PROFILE_CREATE",
        variables: {
          appKey: app.key,
          userId: user.id.to_s,
          provider:,
          profileId: profile_id
        }
      )

      expect(graphql_response.errors).to be_nil
      expect(graphql_response.data.createExternalProfile.profile.provider).to be == provider
      expect(graphql_response.data.createExternalProfile.profile.profileId).to be == profile_id

      expect(ExternalProfile.count).to be == 1

      graphql_post(
        type: "APP_USER_PROFILE_CREATE",
        variables: {
          appKey: app.key,
          userId: user.id.to_s,
          provider:,
          profileId: "#{profile_id}xxx"
        }
      )

      expect(graphql_response.data.createExternalProfile.profile.profileId).to be == "#{profile_id}xxx"
      expect(ExternalProfile.count).to be == 2
    end

    describe "delete & update" do
      let(:provider) { "SOME_API" }
      let(:profile_id) { "1234" }

      before :each do
        graphql_post(
          type: "APP_USER_PROFILE_CREATE",
          variables: {
            appKey: app.key,
            userId: user.id.to_s,
            provider:,
            profileId: profile_id
          }
        )
        @id = graphql_response.data.createExternalProfile.profile.id
      end

      it "external profile update" do
        graphql_post(
          type: "APP_USER_PROFILE_UPDATE",
          variables: {
            appKey: app.key,
            id: @id.to_s,
            profileId: "#{profile_id}aaaa"
          }
        )
        expect(graphql_response.data.updateExternalProfile.profile.profileId).to be == "#{profile_id}aaaa"
      end

      it "external profile update" do
        graphql_post(
          type: "APP_USER_PROFILE_UPDATE",
          variables: {
            appKey: app.key,
            id: @id.to_s,
            profileId: "#{profile_id}aaaa"
          }
        )
        expect(graphql_response.data.updateExternalProfile.profile.profileId).to be == "#{profile_id}aaaa"
      end

      it "external profile delete" do
        graphql_post(
          type: "APP_USER_PROFILE_DELETE",
          variables: {
            appKey: app.key,
            id: @id.to_s
          }
        )
        expect(graphql_response.data.deleteExternalProfile.profile.profileId).to be == profile_id
      end
    end
  end
end
