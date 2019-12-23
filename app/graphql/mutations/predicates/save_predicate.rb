# frozen_string_literal: true

module Mutations
  class Predicates::SavePredicate < Mutations::BaseMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :segment, Types::SegmentType, null: false
    field :errors, Types::JsonType, null: true

    argument :predicates, Types::JsonType, required: true
    argument :id, Integer, required: false
    argument :app_key, String, required: false

    def resolve(app_key:, predicates:, id:)
      current_user = context[:current_user]

      @app = current_user.apps.find_by(key: app_key)
      @segment = @app.segments.find(id)

      data = predicates.map { |o| o.permit(:type, :attribute, :comparison, :value) }

      @segment.update(predicates: data.as_json)

      {
        segment: @segment,
        errors: @segment.errors
      }
    end
  end
end
