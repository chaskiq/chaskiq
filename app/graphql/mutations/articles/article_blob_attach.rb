# frozen_string_literal: true

module Mutations
  module Articles
    class ArticleBlobAttach < Mutations::BaseMutation
      field :article, Types::ArticleType, null: false
      argument :app_key, String, required: true
      argument :id, Integer, required: true
      argument :blob_id, String, 'Signed blob ID generated via `createDirectUpload` mutation', required: true

      def resolve(app_key:, id:, blob_id:)
        # Active Storage retrieves the blob data from DB
        # using a signed_id and associates the blob with the attachment (avatar)
        # current_user.avatar.attach(blob_id)
        app = App.find_by(key: app_key)
        article = app.articles.find(id)
        article.images.attach(blob_id)
        { article: article }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end

class AttachProfileAvatar < GraphQL::Schema::Mutation
  description <<~DESC
    Update the current user's avatar
    (by attaching a blob via signed ID)
  DESC

  argument :blob_id, String,
           'Signed blob ID generated via `createDirectUpload` mutation',
           required: true

  field :user, Types::AgentType, null: true

  def resolve(blob_id:)
    # Active Storage retrieves the blob data from DB
    # using a signed_id and associates the blob with the attachment (avatar)
    current_user.avatar.attach(blob_id)
    { user: current_user }
  end
end
