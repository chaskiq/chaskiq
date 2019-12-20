module Types
  class IntegrationType < Types::BaseObject
    field :id, Integer, null: true
    field :name, String, null: true
    field :settings, Types::JsonType, null: true

    def name
      object.app_package.name
    end
  end
end
