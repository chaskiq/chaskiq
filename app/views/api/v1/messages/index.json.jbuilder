# frozen_string_literal: true

json.collection @messages do |conversation|
  json.id conversation.id
  json.created_at conversation.created_at
  json.state conversation.state
  # json.assignee conversation.assignee
  # json.main_participant conversation.main_participant
  # json.read_at conversation.read_at
  # json.last_message conversation.messages.last.as_json(methods: [:app_user])
end
