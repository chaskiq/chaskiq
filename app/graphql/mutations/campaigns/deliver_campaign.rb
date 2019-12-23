# frozen_string_literal: true

module Mutations
  module Campaigns
    class DeliverCampaign < Mutations::BaseMutation
      field :campaign, Types::CampaignType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :id, Int, required: true
      # argument :mode, String, required: true

      def resolve(id:, app_key:)
        find_app(app_key)
        set_campaign(id)
        # TODO: strict permit here!
        @campaign.send_newsletter
        { campaign: @campaign, errors: @campaign.errors }
      end

      def set_campaign(id)
        @campaign = @app.messages.find(id)
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
