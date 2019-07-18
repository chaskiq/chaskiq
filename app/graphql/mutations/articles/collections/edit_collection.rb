module Mutations
  module Articles
    module Collections
      class EditCollection < Mutations::BaseMutation
        
        field :collection, Types::CollectionType, null: false
        field :errors, Types::JsonType, null: false
        argument :app_key, String, required: true
        argument :title, String, required: true
        argument :description, String, required: false
        argument :id, Integer, required: true
    
        def resolve(app_key:, title:, id:, description:)
          app = current_user.apps.find_by(key: app_key)
          collection = app.article_collections.find(id)

          collection.update({
            title: title,
            description: description
          })

          {collection: collection, errors: collection.errors}
        end



        def current_user
          context[:current_user]
        end
      end
    end
  end
end