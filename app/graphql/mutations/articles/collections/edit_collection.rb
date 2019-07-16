module Mutations
  module Articles
    module Collections
      class EditCollection < Mutations::BaseMutation
        
        field :article, Types::ArticleType, null: false
        argument :app_key, String, required: true
        argument :title, String, required: true
    
        def resolve(app_key: , title:)
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