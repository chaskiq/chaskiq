# frozen_string_literal: true

module Mutations
  class Predicates::SearchPredicate < Mutations::BaseMutation
    field :app_users, Types::PaginatedAppUsersType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def app_users(per, page)
      @app_users = @segment.execute_query
                           .page(page)
                           .per(per)
    end

    argument :app_key, String, required: true
    argument :search, Types::AnyType, required: true
    argument :page, Integer, required: false, default_value: 1
    argument :per, Integer, required: false, default_value: 20
    # argument :mode, String, required: true

    def resolve(app_key:, search:, page:, per:)
      @app = App.find_by(key: app_key)

      authorize! @app, to: :can_read_segments?, with: AppPolicy, context: {
        app: @app
      }

      @segment = @app.segments.new
      resource_params = search.require(:data).permit(
        predicates: [:attribute, :comparison, :type, :value, { value: [] }]
      )
      @segment.assign_attributes(resource_params)
      { app_users: app_users(per, page) }
    end
  end
end
