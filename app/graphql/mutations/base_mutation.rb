module Mutations
  class BaseMutation < GraphQL::Schema::Mutation

    def current_user
      context[:current_user]
    end
  end
end