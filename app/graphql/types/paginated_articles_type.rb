module Types
  class PaginatedArticlesType < Types::PaginatedResultsType
    collection_type(Types::ArticleType)
    #def collection(page: , per: )
    #  object.page(page).per(per)
    #end
  end
end
