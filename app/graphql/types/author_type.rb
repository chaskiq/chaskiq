# frozen_string_literal: true

module Types
  class AuthorType < Types::BaseObject
    field :id, Int, null: false
    field :email, String, null: true
    field :kind, String, null: false
    field :display_name, String, null: false
    field :avatar_url, String, null: true

    delegate :avatar_url, to: :object

    delegate :display_name, to: :object

    def kind
      object.class.model_name.singular
    end
  end
end
