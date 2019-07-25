module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :app, Types::AppType, null: false, description: "get app" do
      argument :key, String, required: true
    end

    def app(key:)
      @app = current_user.apps.find_by(key: key)
    end

    field :apps, [Types::AppType], null: false, description: "get apps"

    def apps
      @app = current_user.apps
    end

    field :help_center, Types::ArticleSettingsType, null: true, description: "help center entry point" do
      argument :domain, String, required: false
    end

    def help_center(domain:)
      ArticleSetting.find_by(subdomain: domain)
    end


    field :user_session, Types::UserType, null: false, description: "get current user email"
    def user_session
      current_user
    end

  end
end
