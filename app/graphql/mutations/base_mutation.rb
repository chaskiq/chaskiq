# frozen_string_literal: true

module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    include Helpers::Authorizator
    def current_user
      context[:current_user]
    end
  end
end
