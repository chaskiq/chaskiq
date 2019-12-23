# frozen_string_literal: true

module Mutations
  module Articles
    class AssignAuthor < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, String, required: true
      argument :author_id, String, required: true

      def resolve(app_key:, id:, author_id:)
        app = App.find_by(key: app_key)
        agent = app.agents.find_by(email: author_id)
        article = app.articles.find(id)
        article.update(author: agent)
        { article: article }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
