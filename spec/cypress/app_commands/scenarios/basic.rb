# frozen_string_literal: true

app = FactoryBot.create(:app, encryption_key: 'unodostrescuatro',
                              active_messenger: 'true',
                              state: 'enabled')
        
agent = app.add_agent(
  email: 'test@test.cl', 
  name: 'sharleena',
  password: "123456",
  password_confirmation: "123456"
)

agent.agent


Doorkeeper::Application.create(
  :name => 'authapp', 
  :redirect_uri => 'http://localhost:5002'
)