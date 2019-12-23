# frozen_string_literal: true

module Mutations
  module Articles
    class ToggleArticle < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :state, String, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, state:)
        app = App.find_by(key: app_key)

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
