module Mutations
  module OauthApps
    class OauthUpdate < Mutations::BaseMutation
      field :oauth_application, Types::OauthApplicationType, null: false
      field :errors, Types::JsonType, null: true

      argument :app_key, String, required: true
      argument :uid, String, required: true 
      argument :params, Types::JsonType, required: true

      def resolve(app_key:, uid:, params:)
        find_app(app_key)
        @application = Doorkeeper.config.application_model.find_by(uid: uid)
        @application.update(
          params.permit(:name, :redirect_uri, :scopes, :confidential)
        )
        { oauth_application: @application, errors: @application.errors }
      end

      def oauth_application(oauth_application_id)
        oauth_application = @app.oauth_applications.find(oauth_application_id)
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end
