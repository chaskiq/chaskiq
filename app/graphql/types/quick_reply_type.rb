# frozen_string_literal: true

module Types
  class QuickReplyType < Types::BaseObject
    field :title, String, null: true
    field :id, String, null: true
    field :content, String, null: true
  end
end
