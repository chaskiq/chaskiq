module Types
  class AppPackageIntegrationType < Types::BaseObject
    field :id, String, null: true
    field :name, String, null: true
    field :definitions, Types::JsonType, null: true
    field :settings, Types::JsonType, null: true
    
    field :icon, String, null: true
    field :description, String, null: true

    def icon
      object.app_package.icon
    end

    def description
      object.app_package.description
    end

    def definitions
      object.app_package.definitions
    end

    def name
      object.app_package.name
    end
  end
end
