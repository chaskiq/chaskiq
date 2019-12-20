module Types
  class AppPackageType < Types::BaseObject
    field :id, String, null: true
    field :name, String, null: true
    field :settings, Types::JsonType, null: true
  end
end
