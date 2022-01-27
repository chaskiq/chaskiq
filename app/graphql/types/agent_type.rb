# frozen_string_literal: true

module Types
  class AgentType < Types::BaseObject
    field :id, Int, null: false
    field :email, String, null: true, authorize: { to: :agent_only?, with: AppPolicy }
    # field :user, [Types::UserType], null: true
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

    field :area_of_expertise, String, null: true
    field :specialization, String, null: true
    field :phone_number, String, null: true
    field :address, String, null: true
    field :availability, String, null: true
    field :enable_deliveries, String, null: true
    field :permissions, String, null: true

    field :display_name, String, null: true

    def display_name
      object.name
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

    def offline
      object.offline?
    end

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

    def dashboard(range:, kind:)
      whitelist = %w[conversations]
      raise "no dashboard available at this address" unless whitelist.include?(kind)

      AgentDashboard.new(
        app: object,
        range: range
      ).send(kind)
    end

    field :dashboard,
          Types::JsonType,
          null: true,
          authorized_scope: { with: AppPolicy } do
      argument :range, Types::JsonType, required: true
      argument :kind,  String, required: true
    end
  end
end
