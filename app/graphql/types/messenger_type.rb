# frozen_string_literal: true

module Types
  class MessengerType < Types::BaseObject
    field :app, Types::PublicAppType, null: true
    field :user, Types::JsonType, null: true # Types::AppUserType, null: true
    field :needs_privacy_consent, Boolean, null: true

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

    def needs_privacy_consent
      privacy_consent_required = app.privacy_consent_required
      user_privacy_consent = context[:get_app_user].call.privacy_consent
      # skip if already consent
      return false if user_privacy_consent
      # skip if privacy consent is none
      return false if privacy_consent_required.blank? || privacy_consent_required == 'none'
      # privacy consent on
      return true if privacy_consent_required == 'all'

      if privacy_consent_required == 'eu'
        %w[
          DE AT BE BG CY HR DK ES EE FI FR GR HU IE
          IT LV LT LU MT NL PL PT CZ RO GB SK SI SE
        ].include?(context[:request]&.location&.country_code)

      end
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
      object.agents.where(available: true).with_attached_avatar.where(bot: nil).limit(5)
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

      segments = object.inbound_settings[k]['predicates']

      return true if segments.blank?

      comparator = SegmentComparator.new(
        user: @user,
        predicates: segments
      )

      comparator.compare
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
        browser: browser.name,
        browser_version: browser.version,
        os: browser.platform.id,
        os_version: browser.platform.version,
        browser_language: language.try(:code)
        # lang: I18n.locale #user_data[:properties][:lang]
      }

      location_params = {
        city: request.location&.city,
        # region_code:      request.location.region,
        region: request.location.try(:region),
        country: request.location&.country || COUNTRY_NAMES[request.location&.country_code&.to_sym],
        country_code: request.location&.country_code,
        lat: request.location&.latitude,
        lng: request.location&.longitude,
        postal: request.location&.postal_code
      }

      browser_params.merge!(location_params) if request.location.present?

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
