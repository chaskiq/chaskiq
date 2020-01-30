# frozen_string_literal: true

module Types
  class MessengerType < Types::BaseObject
    field :app, Types::AppType, null: true # TODO: danger!
    field :user, Types::JsonType, null: true # Types::AppUserType, null: true
    def app
      context[:set_locale].call
      object
    end

    def user
      @user = context[:auth].call
      @user
    end

    field :update_data, Boolean, null: true

    def update_data
      # TODO. detach this,
      # idea. set browser data on redis, update later
      # or perform job here
      context[:get_app_user].call.update(browser_data.compact)
    end

    field :conversations, Types::PaginatedConversationsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
    end

    def conversations(page:, per:)
      @user = context[:get_app_user].call
      @conversations = object.conversations.preload(messages: %i[messageable authorable])
                             .joins(:main_participant)
                             .where(main_participant: @user.id)
                             .order('updated_at desc')
                             .page(page)
                             .per(per)
    end

    field :agents, [Types::AgentType], null: true

    def agents
      object.agents.with_attached_avatar.where(bot: nil).limit(5)
    end

    field :conversation, Types::ConversationType, null: true do
      argument :id, String, required: true # , default_value: 1
      argument :page, Integer, required: false, default_value: 1
      # argument :per, Integer, required: false, default_value: 20
    end

    def conversation(id:, page:)
      @user = context[:get_app_user].call
      @conversation = user_conversations.find_by(key: id)
    end

    field :enabled_for_user, Boolean, null: true

    def enabled_for_user
      return false if object.inbound_settings.blank?

      @user = context[:get_app_user].call

      return false if @user.blank? || @user.blocked?

      k = @user.model_name.name === 'AppUser' ? 'users' : 'visitors'
      return if k.blank?
      return nil unless object.inbound_settings[k]['enabled']
      return true if object.inbound_settings[k]['segment'] == 'all'

      segments = object.inbound_settings[k]["predicates"]

      return true if segments.blank?

      comparator = SegmentComparator.new(
        user: @user, 
        predicates: segments
      )

      return comparator.compare
    end

    private

    def browser_data
      user_data = @user
      request   = context[:request]

      browser = Browser.new(request.user_agent, accept_language: request.accept_language)
      language = browser.accept_language.first

      browser_params = {
        referrer: request.referrer,
        ip: request.remote_ip,
        city: request.location.city,
        # region_code:      request.location.region,
        region: request.location.region,
        country: request.location.country,
        country_code: request.location.country_code,
        lat: request.location.latitude,
        lng: request.location.longitude,
        postal: request.location.postal_code,
        browser: browser.name,
        browser_version: browser.version,
        os: browser.platform.id,
        os_version: browser.platform.version,
        browser_language: language.try(:code)
        # lang:             I18n.locale #user_data[:properties][:lang]
      }

      # resource_params.to_h.merge(request.location.data)
      # data = resource_params.to_h.deep_merge(browser_params)
      data = user_data.slice(:name, :email, :properties).deep_merge(browser_params)
      # #ap = object.add_visit(data)
    end

    def user_conversations
      object.conversations
            .preload(messages: %i[messageable authorable])
            .joins(:messages)
            .where(main_participant: @user.id)
    end
  end
end
