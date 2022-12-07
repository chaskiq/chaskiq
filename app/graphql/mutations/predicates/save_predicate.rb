# frozen_string_literal: true

module Mutations
  class Predicates::SavePredicate < Mutations::BaseMutation
    # TODO: define return fields
    # field :post, Types::PostType, null: false
    field :segment, Types::SegmentType, null: false
    field :errors, Types::AnyType, null: true

    argument :predicates, Types::AnyType, required: true
    argument :id, String, required: false
    argument :app_key, String, required: false

    def resolve(app_key:, predicates:, id:)
      current_user = context[:current_user]

      @app = current_user.apps.find_by(key: app_key)
      @segment = @app.segments.find(id)

      authorize! @segment, to: :can_manage_segments?, with: AppPolicy, context: {
        app: @app
      }

      data = predicates.map { |o| o.permit(:type, :attribute, :comparison, :value, value: []) }

      @segment.update(predicates: data.as_json)

      {
        segment: @segment,
        errors: @segment.errors
      }
    end
  end
end
