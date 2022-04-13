# frozen_string_literal: true

module Mutations
  module AppPackages
    class UpdatePackage < Mutations::BaseMutation
      field :app_package, Types::AppPackageType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :params, Types::AnyType, required: true
      argument :id, String, required: true

      def resolve(app_key:, id:, params:)
        app = find_app(app_key)
        app_package = current_user.app_packages.find(id)

        authorize! app_package, to: :can_manage_app_packages?, with: AppPolicy, context: {
          app:
        }

        authorize! app, to: :manage?, with: AppPolicy

        app_package.update(params.permit!)

        { app_package:, errors: app_package.errors }
      end

      def find_app(app_id)
        current_user.apps.find_by(key: app_id)
      end
    end
  end
end
