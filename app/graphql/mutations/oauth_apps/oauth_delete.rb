module Mutations
  module OauthApps
    class OauthDelete < Mutations::BaseMutation
      field :oauth_application, Types::OauthApplicationType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :uid, String, required: true

      def resolve(app_key:, uid:)
        find_app(app_key)
        @application = @app.oauth_applications.find_by(uid: uid)

        authorize! @application, to: :can_manage_oauth_applications?, with: AppPolicy, context: {
          app: @app
        }
        @application.destroy
        { oauth_application: @application, errors: @application.errors }
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end
