# frozen_string_literal: true

app = App.last
invited_agent = Agent.invite!(email: 'foo@bar.com') # , name: 'John Doe')
role = app.roles.find_or_initialize_by(agent_id: invited_agent.id)
role.save
