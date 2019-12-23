# frozen_string_literal: true

module Mutations
  module Articles
    class ArticleSettingsUpdate < Mutations::BaseMutation
      field :settings, Types::ArticleSettingsType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :settings, Types::JsonType, required: true

      def resolve(app_key:, settings:)
        app = App.find_by(key: app_key)

        # TODO: set specific permitted fields!
        settings.permit!

        if app.article_settings.present?
          settings.merge!(id: app.article_settings.id)
        end

        # ugly, dry
        if settings[:logo]
          app.article_settings.logo.attach(settings[:logo])
        elsif settings[:header_image]
          app.article_settings.header_image.attach(settings[:header_image])
        end

        article_settings = app.article_settings.present? ? app.article_settings : app.build_article_settings
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
