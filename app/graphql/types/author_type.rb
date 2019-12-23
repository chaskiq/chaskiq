# frozen_string_literal: true

module Types
  class AuthorType < Types::BaseObject
    field :id, Int, null: false
    field :email, String, null: true
    field :kind, String, null: false
    field :display_name, String, null: false
    field :avatar_url, String, null: false

    def avatar_url
      object.avatar_url
    end

    def display_name
      object.display_name
    end

    def kind
      object.class.model_name.singular
    end
  end
end
