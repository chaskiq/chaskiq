# frozen_string_literal: true

module Types
  class PaginatedBotTasksType < Types::PaginatedResultsType
    collection_type(Types::BotTaskType)
    # def collection(page: , per: )
    #  object.page(page).per(per)
    # end
  end
end
