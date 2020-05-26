module Mutations
  module OauthApps
    class OauthCreate < Mutations::BaseMutation
      field :oauth_application, Types::OauthApplicationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true

      def resolve(app_key:, params: )
        find_app(app_key)
        @application = @app.oauth_applications.new(
          params.permit(:name, :redirect_uri, :scopes, :confidential)
        )
        @application.owner = @app
        @application.save

        { oauth_application: @application, errors: @application.errors }
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end
