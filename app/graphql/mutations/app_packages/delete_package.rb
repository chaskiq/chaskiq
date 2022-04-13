# frozen_string_literal: true

module Mutations
  module AppPackages
    class DeletePackage < Mutations::BaseMutation
      field :app_package, Types::AppPackageType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :id, String, required: true

      def resolve(id:, app_key:)
        find_app(app_key)

        @app_package = current_user.app_packages.find(id)

        authorize! @app_package, to: :can_manage_app_packages?, with: AppPolicy, context: {
          app:
        }

        delete_app_package(id)
        { app_package: @app_package, errors: @app_package.errors }
      end

      def delete_app_package(id)
        @app_package.destroy
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
