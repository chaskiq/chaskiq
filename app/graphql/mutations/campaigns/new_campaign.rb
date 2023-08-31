# frozen_string_literal: true

module Mutations
  module Campaigns
    class NewCampaign < Mutations::BaseMutation
      # TODO: define return fields
      field :post, String, null: false

      # TODO: define arguments
      # argument :name, String, required: true

      # TODO: define resolve method
      # def resolve(name:)
      #   { post: ... }
      # end
    end
  end
end
