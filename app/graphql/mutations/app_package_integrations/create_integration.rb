module Mutations
  module AppPackageIntegrations
    class CreateIntegration < Mutations::BaseMutation
      field :integration, Types::IntegrationType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :operation, String, required: false
      argument :params, Types::JsonType, required: true
      argument :mode, String, required: true

      def resolve(operation: , app_key: , params:, mode:)
        find_app(app_key)    
        integration = app.app_package_integration.new(params.permit!)
        integration.save if operation.present? && operation == "create"
        { integration: integration , errors: integration.errors }
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end


