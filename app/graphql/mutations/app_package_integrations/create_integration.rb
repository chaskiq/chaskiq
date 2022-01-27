# frozen_string_literal: true

module Mutations
  module AppPackageIntegrations
    class CreateIntegration < Mutations::BaseMutation
      field :integration, Types::AppPackageIntegrationType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true
      argument :app_package, String, required: true

      def resolve(app_key:, app_package:, params:)
        app = find_app(app_key)
        # TODO: check for agent packages or public packages
        app_package = AppPackage.find_by(name: app_package)
        integration = app.app_package_integrations.new
        integration.settings = params.permit!.to_h

        authorize! app_package, to: :can_manage_app_packages?, with: AppPolicy, context: { app: app }

        integration.app_package = app_package
        integration.save

        if app_package.is_external?
          # create default token for app access
          access_token = Doorkeeper::AccessToken.create!(
            application_id: nil,
            resource_owner_id: current_user.id,
            # expires_in: 2.hours,
            scopes: "public"
          )
          integration.update(access_token: access_token.token)
        end

        # if operation.present? && operation == "create"
        { integration: integration, errors: integration.errors }
      end

      def find_app(app_id)
        current_user.apps.find_by(key: app_id)
      end
    end
  end
end
