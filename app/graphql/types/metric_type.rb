module Types
  class MetricType < Types::BaseObject
    field :campaign, [Types::CampaignType], null: true
    field :action, String, null: true
    field :host, String, null: true
    field :data, Types::JsonType, null: true
    field :message_id, String, null: true
  end
end
