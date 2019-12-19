module Types
  class UserType < Types::BaseObject
    field :email, String, null: true
    field :avatar_url, String, null: true
  end
end
