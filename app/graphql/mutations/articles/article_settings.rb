module Mutations
  module Articles
    class ArticleSettings < Mutations::BaseMutation
      
      field :settings, Types::ArticleSettingsType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :settings, Types::JsonType, required: true

      def resolve(settings:)
        app = App.find_by(key: app_key)
        settings = app.article_settings_attributes(settings)
        {settings: settings, errors: settings.errors}
      end


      def current_user
        context[:current_user]
      end
    end
  end
end