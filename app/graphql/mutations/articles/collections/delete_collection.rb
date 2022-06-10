# frozen_string_literal: true

module Mutations
  module Articles
    module Collections
      class DeleteCollection < Mutations::BaseMutation
        field :collection, Types::CollectionType, null: false
        argument :app_key, String, required: true
        argument :id, String, required: true

        def resolve(app_key:, id:)
          app = current_user.apps.find_by(key: app_key)
          authorize! app, to: :can_manage_help_center?, with: AppPolicy, context: {
            app: app
          }
          collection = app.article_collections.find(id)

          collection.destroy
          { collection: collection }
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
