# frozen_string_literal: true

module Mutations
  module AppPackageIntegrations
    class UpdateIntegration < Mutations::BaseMutation
      field :integration, Types::AppPackageIntegrationType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true
      argument :id, Integer, required: true

      def resolve(app_key:, id:, params:)
        app = find_app(app_key)
        integration = app.app_package_integrations.find(id)
        app_package = integration.app_package

        authorize! integration, to: :can_manage_app_packages?, with: AppPolicy, context: { app: app }

        integration.settings = params.permit!.to_h
        integration.app_package = app_package
        integration.save
        { integration: integration, errors: integration.errors }
      end

      def find_app(app_id)
        current_user.apps.find_by(key: app_id)
      end
    end
  end
end
