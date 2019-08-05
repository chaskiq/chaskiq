module Types
  class MetricType < Types::BaseObject
    field :campaign, [Types::CampaignType], null: true
    field :action, String, null: true
    field :host, String, null: true
    field :data, Types::JsonType, null: true
    field :message_id, String, null: true
    field :email, String, null: true
    field :updated_at, type: GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, type: GraphQL::Types::ISO8601DateTime, null: true
    field :app_user_id , type: Integer, null: true

    def app_user_id
      object.trackable.id
    end

    def email
      object.trackable.email
    end
  end
end
