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

    app.update_attributes(encryption_key: "unodostrescuatro")
    key = app.encryption_key

    encrypted_data = JWE.encrypt(data.to_json, key, alg: 'dir')
    request.headers.merge!({
      'HTTP_ENC_DATA' => encrypted_data , 
      'HTTP_APP' => app.key
    })

    # Add stubs to define the results that will be returned:

    Geocoder::Lookup::Test.set_default_stub(
      [
        {
          'coordinates'  => [40.7143528, -74.0059731],
          'latitude'     => 40.7143528,
          'longitude'    => -74.0059731,
          'address'      => 'New York, NY, USA',
          'state'        => 'New York',
          'city'         => 'newy york',
          'region'       => 'new_yorke',
          'state_code'   => 'NY',
          'country'      => 'United States',
          'country_code' => 'US'
        }
      ]
    )
  end

  after do
    # back to defaults
    GraphQL::TestClient.reset_strings
  end

  it "auth encrypted" do
    
    expect(app.app_users).to be_blank

    graphql_post(type: 'AUTH', variables: {})

    expect(graphql_response.data.messenger.user.email).to be_present
    expect(app.reload.app_users.size).to be == 1

    graphql_post(type: 'PING', variables: {})

    expect(graphql_response.data.messenger.app).to be_present

    # for subsequent requests it will not create a new record
    expect(app.reload.app_users.size).to be == 1


    graphql_post(type: 'CONVERSATIONS', variables: {page: 1})

    expect(graphql_response.data.messenger.conversations).to respond_to(:collection)
    expect(graphql_response.data.messenger.conversations).to respond_to(:meta)
    

  end


  it "visit with geo code" do
    graphql_post(type: 'AUTH', variables: {})

    expect(graphql_response.data.messenger.user.email).to be_present

    app_user = app.reload.app_users.last

    expect(app_user.country).to be_present
    expect(app_user.city).to be_present
    expect(app_user.lat).to be_present
    expect(app_user.lng).to be_present

  end

end
