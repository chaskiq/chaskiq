module Mutations
  module Articles
    class EditArticle < Mutations::BaseMutation
      
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :content, Types::JsonType, required: true
      argument :title, String, required: true
      argument :id, Integer, required: true

      # TODO: define resolve method
      def resolve(app_key:, id:, content:, title:)
        app = App.find_by(key: app_key)
        article = app.articles.find(id)

        article.update({
          author: current_user,
          title: title,
          article_content_attributes: {
            id: article.article_content.id,
            html_content: content["html"],
            serialized_content: content["serialized"],
            text_content: content["serialized"]
          }
        })

        {article: article}
      end


      def current_user
        context[:current_user]
      end
    end
  end
end