# frozen_string_literal: true

json.conversation @conversation, partial: 'api/v1/conversations/conversation', as: :conversation

if @messages.present?
  json.messages @messages do |u|
    json.message_source u.message_source.as_json(methods: :type, only: [:id])
    json.app_user u.authorable.as_json(only: %i[id email], methods: [:kind])
    json.conversation_id u.conversation_id
    json.created_at u.created_at
    json.id u.id
    json.message u.message
    json.read_at u.read_at
    json.updated_at u.updated_at
  end
end

if @messages.present?
  json.meta do
    json.total_pages  @messages.total_pages
    json.current_page @messages.current_page
    json.next_page    @messages.next_page
    json.prev_page    @messages.prev_page
  end
end
