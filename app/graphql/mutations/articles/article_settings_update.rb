# frozen_string_literal: true

module Mutations
  module Articles
    class ArticleSettingsUpdate < Mutations::BaseMutation
      field :settings, Types::ArticleSettingsType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :settings, Types::AnyType, required: true

      def resolve(app_key:, settings:)
        app = App.find_by(key: app_key)
        settings.permit!

        authorize! app, to: :can_manage_help_center?, with: AppPolicy, context: {
          app: app
        }
        # TODO: set specific permitted fields!

        settings.merge!(id: app.article_settings.id) if app.article_settings.present?

        article_settings = app.article_settings.presence || app.build_article_settings
        article_settings.update(settings)

        {
          settings: app.article_settings,
          errors: article_settings.errors
        }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
