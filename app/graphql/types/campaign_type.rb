module Types
  class CampaignType < Types::BaseObject
    field :from_name, String, null: true
    field :from_email, String, null: true
    field :reply_email, String, null: true
    field :premailer, String, null: true
    field :serialized_content, String, null: true
    field :description, String, null: true
    field :sent, Boolean, null: true
    field :name, String, null: true
    field :scheduled_at, Types::DateTimeType, null: true
    field :timezone, String, null: true
    field :state, String, null: true
    field :subject, String, null: true
    field :app_id, Integer, null: true
    field :segments, Types::JsonType, null: true
    field :scheduled_to, Types::DateTimeType, null: true
  end
end
