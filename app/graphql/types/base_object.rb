# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    def current_user
      context[:current_user]
    end
  end
end
