# frozen_string_literal: true

module Mutations
  module Campaigns
    class CreateCampaign < Mutations::BaseMutation
      field :campaign, Types::CampaignType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :operation, String, required: false
      argument :campaign_params, Types::JsonType, required: true
      argument :mode, String, required: true

      def resolve(operation:, app_key:, campaign_params:, mode:)
        find_app(app_key)

        @campaign = collection(mode).new(campaign_params.permit!)
        @campaign.save if operation.present? && operation == 'create'
        { campaign: @campaign, errors: @campaign.errors }
      end

      def collection(mode)
        @app.send(mode) if %w[campaigns user_auto_messages tours].include?(mode)
      end

      def find_app(app_id)
        @app = current_user.apps.find_by(key: app_id)
      end
    end
  end
end
