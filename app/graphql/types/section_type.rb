module Types
  class SectionType < Types::BaseObject
    field :title, String, null: true
    field :id, Integer, null: true
    field :description, String, null: true
  end
end