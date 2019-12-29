# frozen_string_literal: true
require "helpers/authorizator"
module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    include Authorizator
    def current_user
      context[:current_user]
    end
  end
end
