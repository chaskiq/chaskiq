# frozen_string_literal: true

module Types
  class ConversationPartType < Types::BaseObject
    field :id, Integer, null: true
    field :message, Types::ConversationPartContentType, null: true
    # field :serialized_content, String, null: true
    # field :html_content, String, null: true
    # field :text_content, String, null: true
    field :step_id, String, null: true
    field :trigger_id, String, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    field :app_user, Types::AuthorType, null: true
    # field :authorable, Types::AuthorType, null: true
    field :private_note, Boolean, null: true
    # field :conversation, Types::ConversationType, null: true
    field :source, String, null: true
    field :message_source, Types::CampaignType, null: true
    field :email_message_id, String, null: true

    field :from_bot, Boolean, null: true

    def from_bot
      object.from_bot?
    end

    def app_user
      #object.authorable

      id = object.authorable_id
      key = object.authorable_type
    
      BatchLoader::GraphQL.for(id).batch(key: key) do |ids, loader, args|
        model = Object.const_get(args[:key])
        model.where(id: ids).each { |record| loader.call(record.id, record) }
      end

    end

    def message
      id = object.messageable_id
      key = object.messageable_type
    
      BatchLoader::GraphQL.for(id).batch(key: key) do |ids, loader, args|
        model = Object.const_get(args[:key])
        model.where(id: ids).each { |record| loader.call(record.id, record) }
      end
    end
  end
end
