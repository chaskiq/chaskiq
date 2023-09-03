# frozen_string_literal: true

class Types::PaginatedResultsType < Types::BaseObject
  # Call this method in subclasses to configure the `collection` field
  def self.collection_type(inner_type_class)
    field :collection, type: [inner_type_class], null: true
  end

  field :meta, type: Types::JsonType, null: true

  def collection
    object
  end

  def meta
    {
      current_page: object.current_page,
      next_page: object.next_page,
      prev_page: object.prev_page,
      total_pages: object.total_pages,
      total_count: object.total_count
    }
  end
end
