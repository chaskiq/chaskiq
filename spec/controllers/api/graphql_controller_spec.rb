require 'rails_helper'

RSpec.describe Api::GraphqlController, type: :controller do

  let!(:app){ FactoryGirl.create :app }
  let(:ref){"http://foo.bar/foo/baz"}
  let(:data){
     {  email: "miguel.michelson@gmail.com",
        referrer: ref,
        properties: {
          user_id: 1,
          name: "Miguel Michelson Martinez",
          created_at: 1163470363,
          lang: "es",
          role: "super"
        }
      }
  }

  before do
    GraphQL::TestClient.reset_strings
    file = Rails.root + "app/javascript/client_messenger/graphql/queries.js"
    GraphQL::TestClient.configure([file])
  end

  after do
    # back to defaults
    GraphQL::TestClient.reset_strings
  end

  it "auth encrypted" do
    app.update_attributes(encryption_key: "unodostrescuatro")
    key = app.encryption_key

    expect(app.app_users).to be_blank

    encrypted_data = JWE.encrypt(data.to_json, key, alg: 'dir')
    request.headers.merge!({
      'HTTP_ENC_DATA' => encrypted_data , 
      'HTTP_APP' => app.key
    })

    graphql_post(type: 'PING', variables: {})

    expect(graphql_response.data.messenger.app).to be_present
    expect(graphql_response.data.messenger.user.email).to be_present

    expect(app.reload.app_users.size).to be == 1


    graphql_post(type: 'PING', variables: {})

    # for subsequent requests it will not create a new record
    expect(app.reload.app_users.size).to be == 1


    graphql_post(type: 'CONVERSATIONS', variables: {page: 1})

    expect(graphql_response.data.messenger.conversations).to respond_to(:collection)
    expect(graphql_response.data.messenger.conversations).to respond_to(:meta)
    

  end


=begin
  it "renders the index template" do

    request.headers.merge!({'HTTP_USER_DATA' => data.to_json })

    post :ping, params: { id: app.key }
    
    data = JSON.parse(response.body)

    expect(response).to be_ok
    expect(JSON.parse(response.body)).to an_instance_of(Hash)
    expect(AppUser.last.last_visited_at).to_not be_blank
  end
=end

end
