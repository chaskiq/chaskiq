# frozen_string_literal: true

module Types
  class RoleType < Types::BaseObject
    field :role, String, null: true
    field :access_list, [String], null: true
    # field :agent, Types::AgentType, null: true
    field :id, String, null: true
    field :agent_id, String, null: true
    field :email, String, null: true
    field :name, String, null: true
    field :first_name, String, null: true
    field :last_name, String, null: true
    field :country, String, null: true
    field :country_code, String, null: true
    field :region, String, null: true
    field :region_code, String, null: true
    field :avatar_url, String, null: true
    field :lang, String, null: true
    field :available, Boolean, null: true
    field :inbound_email_address, String, null: true

    field :enable_deliveries, String, null: true
    field :lang, String, null: true
    field :permissions, String, null: true
    field :area_of_expertise, String, null: true
    field :specialization, String, null: true
    field :phone_number, String, null: true
    field :address, String, null: true
    field :availability, String, null: true

    field :agent_id, String, null: true

    def name
      object.agent.name
    end

    delegate :agent_id, to: :object

    field :owner, Boolean, null: true
    def owner
      object.app.owner_id === object.agent_id
    end

    field :online, Boolean, null: true
    def online
      object.online?
    end

    field :offline, Boolean, null: true

    field :sign_in_count, String, null: true
    field :last_sign_in_at, String, null: true
    field :invitation_accepted_at, String, null: true
    field :invitation_sent_at, String, null: true

    field :display_name, String, null: true

    def display_name
      object.agent.name
    end

    # def id
    #  object.agent_id
    # end

    field :properties, Types::JsonType, null: true

    field :conversations,
          type: Types::PaginatedConversationsType,
          null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def conversations(page:, per:)
      authorize! object, to: :agent_only?, with: AppPolicy
      object.conversations.page(page).per(per)
    end
  end
end
