module Mutations
  module Campaigns
    class CreateCampaign < GraphQL::Schema::RelayClassicMutation
      field :campaign, Types::CampaignType, null: false
      field :errors, Types::JsonType, null: true
      argument :app_key, String, required: true
      argument :id, Int, required: true
      argument :campaign_params, Types::JsonType, required: true
      argument :mode, String, required: true

      def resolve(id: , app_key: , campaign_params:, mode:)
        find_app(app_key)

        @campaign = collection.new(campaign_params)
        @campaign.save
        { campaign: @campaign , errors: @campaign.errors }
      end

      def collection(mode)
        @app.send(mode) if ["campaigns", "user_auto_messages", "tours" ].include?(mode)
      end

      def find_app(app_id)
        @app = context[:current_user].apps.find_by(key: app_id)
      end
    end
  end
end


