# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    include ActionPolicy::GraphQL::Behaviour
    include ActionPolicy::Behaviours::ThreadMemoized
    include ActionPolicy::Behaviours::Memoized
    include ActionPolicy::Behaviours::Namespaced
    def current_user
      context[:current_user]
    end
  end
end
