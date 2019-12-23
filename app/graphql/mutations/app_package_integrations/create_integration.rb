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
        app_package = AppPackage.find_by(name: app_package)
        integration = app.app_package_integrations.new(params.permit!)
        integration.app_package = app_package
        integration.save # if operation.present? && operation == "create"
        { integration: integration, errors: integration.errors }
      end

      def find_app(app_id)
        current_user.apps.find_by(key: app_id)
      end
    end
  end
end
