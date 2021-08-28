# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::GraphqlController, type: :controller do
  let!(:app) { FactoryBot.create :app }
  let(:ref) { "http://foo.bar/foo/baz" }
  let(:data)  do
    {  email: "miguel.michelson@gmail.com",
       referrer: ref,
       properties: {
         user_id: 1,
         name: "Miguel Michelson Martinez",
         created_at: 1_163_470_363,
         lang: "es",
         role: "super"
       } }
  end

  let!(:agent_role) do
    app.add_agent(
      email: "test2@test.cl",
      available: true
    )
  end

  let(:app_user) do
    app.add_user(email: "test@test.cl", first_name: "dsdsa")
  end

  let(:conversation) do
    app.start_conversation(
      message: { html_content: "message" },
      from: app_user
    )
  end

  before do
    file = Rails.root + "app/javascript/packages/messenger/src/client_messenger/graphql/testEntry.ts"
    GraphQL::TestClient.configure(file)
    app.update(encryption_key: "unodostrescuatro")

    allow_any_instance_of(GeocoderRequestOverride).to receive(
      :default_geocoder_service
    ).and_return(:test)
  end

  after do
    GraphQL::TestClient.configure(nil)
  end

  describe "registered user" do
    before :each do
      encrypted_data = JWE.encrypt(data.to_json, app.encryption_key, alg: "dir")
      request.headers.merge!(
        "HTTP_ENC_DATA" => encrypted_data,
        "HTTP_APP" => app.key
      )

      OriginValidator.any_instance
                     .stub(:is_valid?)
                     .and_return(true)
    end

    it "auth encrypted will create registered user" do
      expect(app.app_users).to be_blank

      graphql_post(type: "AUTH", variables: {})

      expect(graphql_response.data.messenger.user.email).to be_present
      expect(graphql_response.data.messenger.user.kind).to be == "AppUser"
      expect(app.reload.app_users.size).to be == 1

      graphql_post(type: "PING", variables: {})

      expect(graphql_response.data.messenger.app).to be_present

      # for subsequent requests it will not create a new record
      expect(app.reload.app_users.size).to be == 1

      graphql_post(type: "CONVERSATIONS", variables: { page: 1 })

      expect(graphql_response.data.messenger.conversations).to respond_to(:collection)
      expect(graphql_response.data.messenger.conversations).to respond_to(:meta)
    end

    it "visit with geo code" do
      graphql_post(type: "AUTH", variables: {})
      graphql_post(type: "PING", variables: {})

      app_user = app.reload.app_users.last

      expect(app_user.country).to be_present
      expect(app_user.city).to be_present
      expect(app_user.lat).to be_present
      expect(app_user.lng).to be_present
    end

    it "visit without geo code" do
      Geocoder.stub(:search).and_return([])

      graphql_post(type: "AUTH", variables: {})
      graphql_post(type: "PING", variables: {})

      app_user = app.reload.app_users.last
      expect(app_user).to be_present
      expect(app_user.ip).to be_present
      expect(app_user.city).to be_nil
      expect(app_user.lat).to be_nil
      expect(app_user.lng).to be_nil
    end
  end

  describe "other domain registered user" do
    before :each do
      encrypted_data = JWE.encrypt(data.to_json, app.encryption_key, alg: "dir")
      request.headers.merge!(
        "HTTP_ENC_DATA" => encrypted_data,
        "HTTP_APP" => app.key
      )

      OriginValidator.any_instance
                     .stub(:host)
                     .and_return("http://other.domain")
    end

    it "will return 422" do
      expect(app.app_users).to be_blank

      graphql_post(type: "AUTH", variables: {})

      expect(response.status).to be == 422

      graphql_post(type: "PING", variables: {})

      expect(response.status).to be == 422
    end
  end

  it "sessionless will create Lead" do
    OriginValidator.any_instance
                   .stub(:is_valid?)
                   .and_return(true)

    request.headers.merge!(
      "HTTP_APP" => app.key
    )

    expect(app.app_users).to be_blank
    graphql_post(type: "AUTH", variables: {})
    expect(app.reload.app_users.size).to be == 1
    expect(graphql_response.data.messenger.user.kind).to be == "Visitor"
    expect(graphql_response.data.messenger.user.email).to be_blank
  end

  describe "unregistered" do
    before :each do
      @user = app.add_anonymous_user({})

      expect(app.app_users.count).to be == 1

      OriginValidator.any_instance
                     .stub(:host)
                     .and_return("http://localhost:3000")

      request.headers.merge!(
        "HTTP_APP" => app.key,
        "HTTP_SESSION_ID" => @user.session_id
      )

      expect(app.reload.app_users.count).to be == 1
      graphql_post(type: "AUTH", variables: {})
    end

    it "sessionless will return Lead" do
      expect(graphql_response.data.messenger.user.kind).to be == "Visitor"
      expect(graphql_response.data.messenger.user.email).to be_blank
      expect(graphql_response.data.messenger.user.session_id).to be == @user.session_id
    end

    it "convert will return Lead" do
      graphql_post(type: "CONVERT", variables: {
                     appKey: app.key,
                     email: "foo@bar.com"
                   })

      expect(graphql_response.data.convertUser.status).to be == "ok"
      expect(app.app_users.first).is_a?(Lead)
    end
  end

  describe "app security, forbidden fields" do
    before :each do
      @user = app.add_anonymous_user({})

      expect(app.app_users.count).to be == 1

      OriginValidator.any_instance
                     .stub(:host)
                     .and_return("http://localhost:3000")

      request.headers.merge!(
        "HTTP_APP" => app.key,
        "HTTP_SESSION_ID" => @user.session_id
      )
    end

    it "get agents" do
      q = "query Messenger{
        messenger {
          user
          app {
            key
            encryptionKey
          }
        }
      }"

      graphql_raw_post(raw: q, variables: {})
      expect(graphql_response.errors).to be_present
    end

    it "get agents" do
      q = "query Messenger{
        messenger {
          user
          app {
            agents {
              name
            }
          }
        }
      }"
      graphql_raw_post(raw: q, variables: {})
      expect(graphql_response.errors).to be_present
    end

    it "secure on oauthApplications" do
      q = "query Messenger{
        messenger {
          user
          app {
            key
            oauthApplications {
              secret
            }
          }
        }
      }"

      graphql_raw_post(raw: q, variables: {})
      expect(graphql_response.errors).to be_present
    end

    it "secure on authorizedOauthApplications" do
      q = "query Messenger{
        messenger {
          user
          app {
            key
            authorizedOauthApplications {
              secret
            }
          }
        }
      }"

      graphql_raw_post(raw: q, variables: {})
      expect(graphql_response.errors).to be_present
    end

    it "secure on agents" do
      q = "query Messenger{
        messenger {
          user
          app {
            key
            agents {
              email
            }
          }
        }
      }"

      graphql_raw_post(raw: q, variables: {})
      expect(graphql_response.errors).to be_present
    end

    it "conversations" do
      app.start_conversation(
        message: { text_content: "aa" },
        from: app.app_users.first
      )

      q = "query Messenger{
        messenger {
          user
          conversations{
            collection{
              id
              key
              state
            }
            meta
          }
          app {
            key
            agents {
              email
            }
          }
        }
      }"

      graphql_raw_post(raw: q, variables: {
                         page: 1, per: 20
                       })

      expect(graphql_response.errors).to be_present
    end

    describe "app access" do
      before :each do
        app.start_conversation(
          message: { text_content: "aa" },
          from: app.app_users.first
        )
        agent_role
      end

      it "messenger" do
        q = "query Messenger{
          messenger {
            user
            app {
              key
              agents {
                conversations{
                  collection{
                    key
                  }
                }
              }
            }
          }
        }"

        graphql_raw_post(raw: q)
        puts graphql_response.errors
        expect(graphql_response.errors).to be_present
      end

      it "messenger" do
        q = "query Messenger{
          messenger {
            user
            agents {
              conversations{
                collection{
                  key
                }
              }
            }
            app {
              key
            }
          }
        }"

        graphql_raw_post(raw: q)
        puts graphql_response.errors
        expect(graphql_response.errors).to be_present
      end

      it "messenger" do
        q = "query Messenger{
          messenger {
            user
            agents {
              email
            }
            app {
              key
            }
          }
        }"

        graphql_raw_post(raw: q)
        puts graphql_response.errors
        expect(graphql_response.errors).to be_present
      end
    end
  end
end
