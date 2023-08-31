# frozen_string_literal: true

module Types
  class BotTaskFilterType < Types::BaseInputObject
    argument :state, [String], required: false
    argument :users, [String], required: false
  end
end
