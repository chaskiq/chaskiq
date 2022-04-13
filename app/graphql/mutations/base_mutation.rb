# frozen_string_literal: true

module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    include ActionPolicy::GraphQL::Behaviour
    def current_user
      context[:current_user]
    end

    def track_resource_event(resource, action, data = {}, app_id = nil)
      resource.log_async(
        action:,
        user: current_user,
        data:,
        ip: context[:request].remote_ip,
        app_id:
      )
    end
  end
end
