# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    include ActionPolicy::GraphQL::Behaviour
    def current_user
      context[:current_user]
    end
  end
end
