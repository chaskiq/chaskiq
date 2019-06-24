module Types
  class ConversationPartContentType < Types::BaseObject
    field :serialized_content, String, null: true
    field :html_content, String, null: true
    field :text_content, String, null: true
  end
end
