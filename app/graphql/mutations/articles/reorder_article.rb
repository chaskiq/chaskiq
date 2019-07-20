module Mutations
  module Articles
    class ReorderArticle < Mutations::BaseMutation
      
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, Integer, required: true
      argument :position, Integer, required: true
      argument :section, Integer, required: false
      argument :collection, Integer, required: false

      def resolve(app_key:, id:, position:, section:, collection:)
        app = App.find_by(key: app_key)
        article = app.articles.find(id)

        ### article.reorder ?

        {article: article}
      end


      def current_user
        context[:current_user]
      end
    end
  end
end