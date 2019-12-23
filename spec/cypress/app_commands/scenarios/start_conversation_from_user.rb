# frozen_string_literal: true

text = 'foobar'
serialized_content = "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"

app = FactoryBot.create(:app, encryption_key: 'unodostrescuatro',
                              active_messenger: 'true',
                              state: 'enabled')

agent = app.add_agent(email: 'test@test.cl', name: 'sharleena')
user = app.add_user(email: 'test@test.cl')

app.start_conversation(
  message: {
    serialized_content: serialized_content,
    html_content: text
  },
  from: agent.agent,
  participant: user
)
