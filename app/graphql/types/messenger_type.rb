module Types
  class MessengerType < Types::BaseObject
    field :app, Types::AppType, null: true # TODO: danger!
    field :user, Types::JsonType, null: true #Types::AppUserType, null: true

    def app
      object
    end

    def user
      context[:auth].call
    end

    field :conversations, Types::PaginatedConversationsType, null:true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def conversations(page:, per:)
      @user = context[:get_app_user].call
      @conversations = object.conversations.where(main_participant: @user.id)
                                        .order("id desc")
                                        .page(page)
                                        .per(5)
    end

    field :agents, [Types::AgentType], null: true

    def agents
      object.agents.limit(5)
    end

    field :conversation, Types::ConversationType, null: true do
      argument :id, String, required: true #, default_value: 1
      argument :page, Integer, required: false, default_value: 1
      #argument :per, Integer, required: false, default_value: 20
    end

    def conversation(id:, page:)
      @user = context[:get_app_user].call
      @conversation = user_conversations.find_by(key: id)
    end


    field :enabled_for_user, Boolean, null: true

    def enabled_for_user
      @user = context[:get_app_user].call
      k = @user.model_name.name === "AppUser" ? "users" : "visitors" 
      return if k.blank?
      return nil unless object.inbound_settings[k]["enabled"]
      return true if object.inbound_settings[k]["all"]
      object.query_segment(k).find_by(id: @user.id)
    end

private
    def get_user
      user_data = context[:user_data]
      request   = context[:request]

      browser = Browser.new(request.user_agent, accept_language: request.accept_language)
      language = browser.accept_language.first

      browser_params = {
        referrer:         request.referrer,
        ip:               request.remote_ip,
        city:             request.location.data["city"],
        region_code:      request.location.data["region_code"],
        region:           request.location.data["region"],
        country:          request.location.data["country_name"],
        country_code:     request.location.data["country_code"],
        lat:              request.location.data["latitude"],
        lng:              request.location.data["longitude"],
        postal:           request.location.data["zipcode"],
        browser:          browser.name,
        browser_version:  browser.version,
        os:               browser.platform.id,
        os_version:       browser.platform.version,
        browser_language: language.try(:code),
        lang:             user_data[:properties].present? ? user_data[:properties].fetch(:lang) : nil
      }
  
      # resource_params.to_h.merge(request.location.data)
      #data = resource_params.to_h.deep_merge(browser_params)
      data = user_data.slice(:name, :email, :properties).deep_merge(browser_params)
      ap = object.add_visit(data)
    end

    def user_conversations
      object.conversations.where(main_participant: @user.id)
    end

  end
end
