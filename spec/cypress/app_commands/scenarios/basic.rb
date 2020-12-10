# frozen_string_literal: true

Geocoder::Lookup::Test.set_default_stub(
  [
    {
      'coordinates' => [40.7143528, -74.0059731],
      'latitude' => 40.7143528,
      'longitude' => -74.0059731,
      'address' => 'New York, NY, USA',
      'state' => 'New York',
      'city' => 'newy york',
      'region' => 'new_yorke',
      'state_code' => 'NY',
      'country' => 'United States',
      'country_code' => 'US'
    }
  ]
)


app = FactoryBot.create(:app,
  domain_url: 'http://localhost:5002', 
  encryption_key: 'unodostrescuatro',
  active_messenger: 'true',
  state: 'enabled')
        
agent = app.add_agent({
  email: 'test@test.cl', 
  name: 'sharleena',
  password: "123456",
  password_confirmation: "123456"
})

agent.agent


Doorkeeper::Application.create(
  :name => 'authapp', 
  :redirect_uri => 'http://localhost:5002'
)

true