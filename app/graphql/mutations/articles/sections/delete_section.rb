
module Mutations
  module Articles
    module Sections
      class DeleteSection < Mutations::BaseMutation
        
        field :article, Types::ArticleType, null: false
        argument :app_key, String, required: true
        argument :collection_id, Integer, required: true
        argument :title, String, required: true

    
        def resolve(app_key: , collection_id: , title:)
          binding.pry
          {article: article}
        end


        def current_user
          context[:current_user]
        end
      end
    end
  end
end