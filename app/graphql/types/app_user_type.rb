# frozen_string_literal: true

module Types
  class AppUserType < Types::BaseObject
    field :id, Int, null: false
    field :email, String, null: true
    # field :user, [Types::UserType], null: true
    field  :last_visited_at, String, null: true
    field  :referrer, String, null: true
    field  :state, String, null: true
    field  :ip, String, null: true
    field  :city, String, null: true
    field  :region, String, null: true
    field  :country, String, null: true
    field  :lat, Float, null: true
    field  :lng, Float, null: true
    field  :postal, String, null: true
    field  :web_sessions, String, null: true
    field  :timezone, String, null: true
    field  :browser, String, null: true
    field  :browser_version, String, null: true
    field  :os, String, null: true
    field  :os_version, String, null: true
    field  :browser_language, String, null: true
    field  :lang, String, null: true

    field :display_name, String, null: true
    field :full_name, String, null: true
    field :name, String, null: true

    field :app, [Types::AppType], null: true
    field :online, Boolean, null: true

    field :avatar_url, String, null: true

    field :properties, Types::JsonType, null: true

    field :external_profiles, [Types::ExternalProfileType], null: true 

    def state
      object.subscription_state
    end

    def online
      object.online?
    end

    field :offline, Boolean, null: true

    def offline
      object.offline?
    end

    field :properties, Types::JsonType, null: true

    field :visits, Types::PaginatedVisitsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def visits(page:, per:)
      object.visits.page(page).per(per).order('id desc')
    end

    def full_name
      "#{object.first_name} #{object.last_name}"
    end

    field :conversations, type: Types::PaginatedConversationsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def conversations(page:, per:)
      object.conversations
            .order('updated_at desc')
            .page(page)
            .per(per)
    end

    def dashboard(range:, kind:)
      whitelist = %w[conversations visits]
      unless whitelist.include?(kind)
        raise 'no dashboard available at this address'
      end

      AgentDashboard.new(
        app: object,
        range: range
      ).send(kind)
    end

    field :dashboard, Types::JsonType, null: true do
      argument :range, Types::JsonType, required: true
      argument :kind,  String, required: true
    end
  end
end
