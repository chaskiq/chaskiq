module Types
  class QueryDocsType < Types::BaseObject

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


    field :user_session, Types::UserType, null: false, description: "get current user email"
    def user_session
      current_user
    end

  end
end
