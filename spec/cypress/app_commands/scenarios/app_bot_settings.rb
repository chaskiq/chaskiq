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
  state: 'enabled'
)

agent = app.add_agent({email: 'test@test.cl', name: 'sharleena'})
# user = app.add_user({email: "test@test.cl"})

app.update(
  timezone: 'UTC',
  lead_tasks_settings: {
    delay: false,
    routing: 'assign',
    email_requirement: 'email_only',
    assignee: agent.agent.id,
    share_typical_time: true
  },
  email_requirement: command_options.fetch('email_requirement'),
  team_schedule: [
    { day: 'tue', from: '01:00', to: '01:30' }
  ]
)
