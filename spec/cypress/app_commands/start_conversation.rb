# frozen_string_literal: true

text = command_options.fetch('text') || 'aaa'
serialized_content = "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
app = App.find_by(key: command_options.fetch('app_key'))

app.assignment_rules.create(
  title: 'test',
  agent: app.agents.first,
  conditions: command_options.fetch('rules') || [],
  priority: 1
)

app.conversations.first.add_message(
  from: app.agents.first,
  message: {
    html_content: '<p>ss</p>',
    serialized_content: serialized_content,
    text_content: serialized_content
  }
)
