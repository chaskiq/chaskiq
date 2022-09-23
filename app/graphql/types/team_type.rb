
module Types
  class TeamType < Types::BaseObject
    field :id, String, null: true
    field :name, String, null: true
    field :description, String, null: true

    field :agents, Types::PaginatedAgentTeamsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
      argument :sort, String, required: false
    end

  end
end