# frozen_string_literal: true

json.collection @conversations do |conversation|
  json.id conversation.id
  json.created_at conversation.created_at
  json.assignee conversation.assignee
  json.main_participant conversation.main_participant
  json.read_at conversation.read_at
  json.last_message conversation.messages.visibles.last
end

json.meta do
  json.total_pages  @conversations.total_pages
  json.current_page @conversations.current_page
  json.next_page    @conversations.next_page
  json.prev_page    @conversations.prev_page
end
