module Types
  class AppUserType < Types::BaseObject
    field :id, Int, null: false
    field :email, String, null: true
    #field :user, [Types::UserType], null: true

    field  :last_visited_at, String, null: true
    field  :referrer, String, null: true
    field  :state, String, null: true
    field  :ip, String, null: true
    field  :city, String, null: true
    field  :region, String, null: true
    field  :country, String, null: true
    field  :lat, String, null: true
    field  :lng, String, null: true
    field  :postal, String, null: true
    field  :web_sessions, String, null: true
    field  :timezone, String, null: true
    field  :browser, String, null: true
    field  :browser_version, String, null: true
    field  :os, String, null: true
    field  :os_version, String, null: true
    field  :browser_language, String, null: true
    field  :lang, String, null: true


    field :app, [Types::AppType], null: true
    field :online, Boolean, null: true
    def online
      object.online?
    end

    field :offline, Boolean, null: true

    def offline
      object.offline?
    end

    field :properties, Types::JsonType, null: true

    field :conversations, type: Types::PaginatedConversationsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def conversations(page: , per:)
      object.conversations.page(page).per(per)
    end

  end
end
