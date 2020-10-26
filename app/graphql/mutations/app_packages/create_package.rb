# frozen_string_literal: true

module Mutations
  module AppPackages
    class CreatePackage < Mutations::BaseMutation
      field :app_package, Types::AppPackageType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true
      argument :app_package, String, required: true

      def resolve(app_key:, app_package:, params:)
        app = find_app(app_key)
        authorize! app, to: :manage?, with: AppPolicy
        app_package = current_user.app_packages.new(params.permit!)
        app_package.state = 'enabled'
        app_package.save
        # app_package.save # if operation.present? && operation == "create"
        { app_package: app_package, errors: app_package.errors }
      end

      def find_app(app_id)
        current_user.apps.find_by(key: app_id)
      end
    end
  end
end
