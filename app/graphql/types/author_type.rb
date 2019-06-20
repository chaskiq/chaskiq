module Types
  class AuthorType < Types::BaseObject
    field :id, Int, null: false
    field :email, String, null: true
    field :kind , String, null: false
    field :display_name, String, null: false

    def kind
      object.class.model_name.singular
    end
  end
end