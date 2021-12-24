# frozen_string_literal: true

module Mutations
  module Articles
    class ToggleArticle < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :state, String, required: true

      def resolve(app_key:, id:, state:)
        app = App.find_by(key: app_key)

        authorize! object, to: :can_manage_help_center?, with: AppPolicy, context: {
          app: app
        }

        article = app.articles.find(id)
        article.state = state
        article.save

        { article: article }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
