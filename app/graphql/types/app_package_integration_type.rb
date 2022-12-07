# frozen_string_literal: true

module Types
  class AppPackageIntegrationType < Types::BaseObject
    field :id, String, null: true
    field :name, String, null: true
    field :definitions, Types::JsonType, null: true
    field :settings, Types::JsonType, null: true do
      def visible?(context)
        context[:current_user].is_a?(Agent)
      end
    end
    field :icon, String, null: true
    field :description, String, null: true
    field :state, String, null: true
    field :hook_url, String, null: true do
      def visible?(context)
        context[:current_user].is_a?(Agent)
      end
    end
    field :oauth_authorize, String, null: true do
      def visible?(context)
        context[:current_user].is_a?(Agent)
      end
    end

    # def self.authorized?(object, context)
    #  super && context[:current_user].is_a?(Agent) && context[:current_user].apps.include?(object.app)
    # end

    def icon
      object.app_package.icon
    end

    def state
      object.app_package.state
    end

    def description
      object.app_package.description
    end

    def definitions
      object.app_package.definitions
    end

    field :capabilities, [String], null: true
    def capabilities
      object.app_package.capability_list
    end

    field :tag_list, [String], null: true
    def tag_list
      object.app_package.tag_list
    end

    def name
      object.app_package.name
    end

    field :call_hook, Types::JsonType, null: true do
      argument :kind, String, required: true, default_value: ""
      argument :ctx, Types::AnyType, required: true, default_value: ""
    end

    def call_hook(kind:, ctx:)
      object.call_hook({
                         kind: kind,
                         ctx: ctx.merge!(
                           lang: I18n.locale,
                           current_user: current_user
                         )
                       })
    end
  end
end
