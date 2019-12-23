# frozen_string_literal: true

app = FactoryBot.create(:app, encryption_key: 'unodostrescuatro',
                              active_messenger: 'true',
                              state: 'enabled')

agent = app.add_agent(email: 'test@test.cl', name: 'sharleena')
# user = app.add_user({email: "test@test.cl"})

app.update(
  timezone: 'UTC',
  lead_tasks_settings: {
    delay: false,
    routing: 'assign',
    email_requirement: 'email_only',
    assignee: agent.agent,
    share_typical_time: true
  },
  email_requirement: command_options.fetch('email_requirement'),
  team_schedule: [
    { day: 'tue', from: '01:00', to: '01:30' }
  ]
)
