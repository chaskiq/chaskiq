# frozen_string_literal: true

module Mutations
  module AppPackageIntegrations
    class DeleteIntegration < Mutations::BaseMutation
      field :integration, Types::AppPackageIntegrationType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :id, String, required: true
      # argument :mode, String, required: true

      def resolve(id:, app_key:)
        find_app(app_key)
        @integration = @app.app_package_integrations.find(id)
        authorize! @integration, to: :can_manage_app_packages?, with: AppPolicy, context: { app: @app }
        delete_integration(id)
        { integration: @integration, errors: @integration.errors }
      end

      def delete_integration(id)
        # TODO: async relation data destroy
        @integration.destroy
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
