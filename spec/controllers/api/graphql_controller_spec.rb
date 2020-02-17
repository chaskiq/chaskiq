# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::GraphqlController, type: :controller do
  let!(:app) { FactoryBot.create :app }
  let(:ref) { 'http://foo.bar/foo/baz' }
  let(:data)  do
    {  email: 'miguel.michelson@gmail.com',
       referrer: ref,
       properties: {
         user_id: 1,
         name: 'Miguel Michelson Martinez',
         created_at: 1_163_470_363,
         lang: 'es',
         role: 'super'
       } }
  end

  before do
    GraphQL::TestClient.reset_strings
    file = Rails.root + 'app/javascript/client_messenger/graphql/queries.js'
    GraphQL::TestClient.configure([file])
    app.update(encryption_key: 'unodostrescuatro')
  end

  after do
    # back to defaults
    GraphQL::TestClient.reset_strings
  end

  describe 'registered user' do
    before :each do
      encrypted_data = JWE.encrypt(data.to_json, app.encryption_key, alg: 'dir')
      request.headers.merge!(
        'HTTP_ENC_DATA' => encrypted_data,
        'HTTP_APP' => app.key
      )

      OriginValidator.any_instance
      .stub(:is_valid?)
      .and_return(true)
    end

    it 'auth encrypted will create registered user' do
      expect(app.app_users).to be_blank

      graphql_post(type: 'AUTH', variables: {})

      expect(graphql_response.data.messenger.user.email).to be_present
      expect(graphql_response.data.messenger.user.kind).to be == 'AppUser'
      expect(app.reload.app_users.size).to be == 1

      graphql_post(type: 'PING', variables: {})

      expect(graphql_response.data.messenger.app).to be_present

      # for subsequent requests it will not create a new record
      expect(app.reload.app_users.size).to be == 1

      graphql_post(type: 'CONVERSATIONS', variables: { page: 1 })

      expect(graphql_response.data.messenger.conversations).to respond_to(:collection)
      expect(graphql_response.data.messenger.conversations).to respond_to(:meta)
    end

    it 'visit with geo code' do
      graphql_post(type: 'AUTH', variables: {})
      graphql_post(type: 'PING', variables: {})

      app_user = app.reload.app_users.last

      expect(app_user.country).to be_present
      expect(app_user.city).to be_present
      expect(app_user.lat).to be_present
      expect(app_user.lng).to be_present
    end
  end

  describe 'other domain registered user' do
    before :each do
      encrypted_data = JWE.encrypt(data.to_json, app.encryption_key, alg: 'dir')
      request.headers.merge!(
        'HTTP_ENC_DATA' => encrypted_data,
        'HTTP_APP' => app.key
      )

      OriginValidator.any_instance
      .stub(:host)
      .and_return("http://other.domain")
    end

    it 'will return 422' do
      expect(app.app_users).to be_blank

      graphql_post(type: 'AUTH', variables: {})

      expect(response.status).to be == 422

      graphql_post(type: 'PING', variables: {})

      expect(response.status).to be == 422

    end
  end


  it 'sessionless will create Lead' do

    OriginValidator.any_instance
    .stub(:is_valid?)
    .and_return(true)

    request.headers.merge!(
      'HTTP_APP' => app.key
    )

    expect(app.app_users).to be_blank
    graphql_post(type: 'AUTH', variables: {})
    expect(app.reload.app_users.size).to be == 1
    expect(graphql_response.data.messenger.user.kind).to be == 'Visitor'
    expect(graphql_response.data.messenger.user.email).to be_blank
  end

  describe 'unregistered' do
    
    before :each do

      @user = app.add_anonymous_user({})

      expect(app.app_users.count).to be == 1


      OriginValidator.any_instance
      .stub(:host)
      .and_return("http://localhost:3000")

      request.headers.merge!(
        'HTTP_APP' => app.key,
        'HTTP_SESSION_ID' => @user.session_id
      )

      expect(app.reload.app_users.count).to be == 1
      graphql_post(type: 'AUTH', variables: {})

    end


    it 'sessionless will return Lead' do
      expect(graphql_response.data.messenger.user.kind).to be == 'Visitor'
      expect(graphql_response.data.messenger.user.email).to be_blank
      expect(graphql_response.data.messenger.user.session_id).to be == @user.session_id
    end

    it 'convert will return Lead' do
      graphql_post(type: 'CONVERT', variables: {
        appKey: app.key,
        email: "foo@bar.com"
      })

      expect(graphql_response.data.convertUser.status).to be == 'ok'
      expect(app.app_users.first).is_a?(Lead)
    end

  end
end
