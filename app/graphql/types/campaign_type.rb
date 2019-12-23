# frozen_string_literal: true

module Types
  class CampaignType < Types::BaseObject
    field :id, Int, null: true
    field :type, String, null: true
    field :from_name, String, null: true
    field :url, String, null: true
    field :from_email, String, null: true
    field :reply_email, String, null: true
    field :premailer, String, null: true
    field :serialized_content, String, null: true
    field :description, String, null: true
    field :sent, Boolean, null: true
    field :config_fields, Types::JsonType, null: true
    field :hidden_constraints, Types::JsonType, null: true
    field :stats_fields, Types::JsonType, null: true
    field :name, String, null: true
    field :timezone, String, null: true
    field :state, String, null: true
    field :subject, String, null: true
    field :app_id, Integer, null: true
    field :segments, Types::JsonType, null: true
    field :scheduled_at, GraphQL::Types::ISO8601DateTime, null: true
    field :scheduled_to, GraphQL::Types::ISO8601DateTime, null: true
    field :steps, [Types::JsonType], null: true

    field :counts, Types::JsonType, null: true
    def counts
      object.metrics.group(:action).count(:trackable_id)
    end

    field :metrics, Types::PaginatedMetricsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def metrics(page: 1, per: 20)
      @metrics = object.metrics
                       .order('id desc')
                       .page(page)
                       .per(per)
      # render :index
    end

    def steps
      object.respond_to?(:steps) ? object.steps : nil
    end

    def url
      object.respond_to?(:url) ? object.url : nil
    end
  end
end
