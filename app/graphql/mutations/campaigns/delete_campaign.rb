# frozen_string_literal: true

module Mutations
  module Campaigns
    class DeleteCampaign < Mutations::BaseMutation
      field :campaign, Types::CampaignType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :id, Int, required: true
      # argument :mode, String, required: true

      def resolve(id:, app_key:)
        find_app(app_key)
        delete_campaign(id)
        { campaign: @campaign, errors: @campaign.errors }
      end

      def delete_campaign(id)
        # TODO: async relation data destroy
        @campaign = @app.messages.find(id).destroy
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
