# frozen_string_literal: true

module Mutations
  module Articles
    class ArticleSettingsDeleteLang < Mutations::BaseMutation
      field :settings, Types::ArticleSettingsType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :lang_item, String, required: true

      def resolve(app_key:, lang_item:)
        app = App.find_by(key: app_key)
        authorize! app, to: :can_manage_help_center?, with: AppPolicy, context: {
          app: app
        }
        article_settings = app.article_settings.presence || app.build_article_settings

        translation = article_settings.translations.find_by(locale: lang_item)
        translation.destroy if translation.present?

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
