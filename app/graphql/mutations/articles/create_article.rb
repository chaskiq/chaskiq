# frozen_string_literal: true

module Mutations
  module Articles
    class CreateArticle < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :content, Types::AnyType, required: true
      argument :title, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale

      def resolve(app_key:, content:, title:, lang:)
        app = App.find_by(key: app_key)

        article = app.articles.create(
          author: current_user,
          title: title,
          article_content_attributes: {
            html_content: content["html"],
            serialized_content: content["serialized"],
            text_content: content["serialized"]
          }
        )

        authorize! article, to: :can_manage_help_center?, with: AppPolicy, context: {
          app: app
        }
        I18n.locale = lang

        { article: article }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
