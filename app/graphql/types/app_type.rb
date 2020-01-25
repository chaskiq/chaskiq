# frozen_string_literal: true

module Types
  class AppType < Types::BaseObject
    field :key, String, null: true
    field :name, String, null: true
    field :state, String, null: true
    field :tagline, String, null: true
    field :domain_url, String, null: true
    field :active_messenger, String, null: true
    field :timezone, String, null: true
    field :theme, String, null: true
    field :config_fields, Types::JsonType, null: true
    field :preferences, Types::JsonType, null: true
    field :app_users, [Types::AppUserType], null: true
    field :customization_colors, Types::JsonType, null: true
    # field :triggers, Types::JsonType, null: true
    field :team_schedule, Types::JsonType, null: true
    field :reply_time, String, null: true
    field :inbound_settings, Types::JsonType, null: true
    field :email_requirement, String, null: true
    field :greetings, String, null: true
    field :intro, String, null: true
    field :tagline, String, null: true
    field :user_tasks_settings, Types::JsonType, null: true
    field :lead_tasks_settings, Types::JsonType, null: true
    field :gather_social_data, Boolean, null: true
    field :translations, [Types::JsonType], null: true
    field :available_languages, [Types::JsonType], null: true
    field :outgoing_email_domain, String, null: true
    field :custom_fields, [Types::JsonType], null: true
    field :app_packages, [Types::AppPackageType], null: true

    def app_packages
      integrations = object.app_package_integrations.map(&:app_package_id)
      integrations.any? ? 
      AppPackage.where.not("id in(?)", integrations) : AppPackage.all
    end

    field :app_package_integrations, [Types::AppPackageIntegrationType], null: true

    def app_package_integrations
      object.app_package_integrations
    end

    field :encryption_key, String, null: true

    def encryption_key
      object.encryption_key unless context[:from_api]
    end

    field :tasks_settings, Types::JsonType, null: true

    def tasks_settings
      context[:get_app_user].call.is_a?(AppUser) ?
      object.user_tasks_settings : object.lead_tasks_settings
    end

    def available_languages
      object.translations.map(&:locale)
    end

    field :conversations, Types::PaginatedConversationsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
      argument :sort, String, required: false
      argument :filter, String, required: false
    end

    def conversations(per:, page:, filter:, sort:)
      @collection = object.conversations
                          .left_joins(:messages)
                          .where.not(conversation_parts: { id: nil })
                          .distinct
                          .page(page)
                          .per(per)

      @collection = @collection.where(state: filter) if filter.present?

      if sort.present?
        s = case sort
            when 'newest' then 'updated_at desc'
            when 'oldest' then 'updated_at asc'
            when 'priority-first' then 'priority asc, updated_at desc'
            else
              'id desc'
        end

        if sort != "unfiltered"
          @collection = @collection.where
                                   .not(latest_user_visible_comment_at: nil)
        end

        @collection = @collection.order(s)
      end

      @collection
    end

    field :in_business_hours, Boolean, null: true

    def in_business_hours
      object.in_business_hours?(Time.current)
    end

    field :business_back_in, Types::JsonType, null: true

    def business_back_in
      object.business_back_in(Time.current)
    end

    field :conversation, Types::ConversationType, null: true do
      argument :id, String, required: false
    end

    def conversation(id:)
      object.conversations.find_by(key: id)
    end

    field :app_user, Types::AppUserType, null: true do
      argument :id, Integer, required: false
    end

    def app_user(id:)
      object.app_users.find(id)
    end

    field :campaigns, Types::PaginatedCampaignType, null: true do
      argument :mode, String, required: false
    end

    def campaigns(mode:)
      if %w[campaigns user_auto_messages tours].include?(mode)
        collection = object.send(mode)
      end
      collection.page(1).per(20)
    end

    field :campaign, Types::CampaignType, null: true do
      argument :mode, String, required: false
      argument :id, String, required: false
    end

    def campaign(mode:, id:)
      if %w[campaigns user_auto_messages tours].include?(mode)
        collection = object.send(mode)
      end
      collection.find(id)
    end

    field :agents, [Types::AgentType], null: false

    def agents
      object.agents.where(invitation_token: nil)
    end

    field :not_confirmed_agents, [Types::AgentType], null: false

    def not_confirmed_agents
      object.agents.invitation_not_accepted
    end

    field :agent, Types::AgentType, null: false do
      argument :id, Integer, required: true
    end

    def agent(id:)
      object.agents.find(id)
    end

    field :segments, [Types::SegmentType], null: true

    def segments
      Segment.union_scope(
        object.segments.all, Segment.where('app_id is null')
      ).order('id asc')
    end

    field :segment, Types::SegmentType, null: true do
      argument :id, Integer, required: true
    end

    def segment(id:)
      s = Segment.where('app_id is null ').where(id: id).first
      s.present? ? s : object.segments.find(id)
    end

    field :assignment_rules, [Types::AssignmentRuleType], null: true

    def assignment_rules
      object.assignment_rules.order('priority asc')
    end

    field :article_settings, Types::ArticleSettingsType, null: true

    def article_settings
      object.article_settings.blank? ? object.build_article_settings : object.article_settings
    end

    field :articles, Types::PaginatedArticlesType, null: true do
      argument :page, Integer, required: true
      argument :per, Integer, required: false, default_value: 20
      argument :lang, String, required: false, default_value: I18n.default_locale
      argument :mode, String, required: false, default_value: 'all'
    end

    def articles(page:, per:, lang:, mode:)
      I18n.locale = lang
      if mode == 'all'
        object.articles.page(page).per(per)
      elsif mode == 'published'
        object.articles.published.page(page).per(per)
      elsif mode == 'draft'
        object.articles.draft.page(page).per(per)
      end
    end

    field :articles_uncategorized, Types::PaginatedArticlesType, null: true do
      argument :page, Integer, required: true
      argument :per, Integer, required: false, default_value: 20
      argument :lang, String, required: false, default_value: I18n.default_locale
    end

    def articles_uncategorized(page:, per:, lang:)
      I18n.locale = lang
      object.articles.without_collection.page(page).per(per)
    end

    field :article, Types::ArticleType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def article(id:, lang:)
      I18n.locale = lang
      object.articles.friendly.find(id)
    end

    field :collections, [Types::CollectionType], null: true do
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def collections(lang:)
      I18n.locale = lang.to_sym
      object.article_collections
    end

    field :collection, Types::CollectionType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def collection(id:, lang:)
      I18n.locale = lang.to_sym
      object.article_collections.friendly.find(id)
    end

    field :bot_tasks, [Types::BotTaskType], null: true do
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
      argument :mode, String, required: false, default_value: 'leads'
    end

    def bot_tasks(lang:, mode:)
      if mode == 'leads'
        object.bot_tasks.for_leads # .page(page).per(per)
      elsif mode == 'users'
        object.bot_tasks.for_users
      end
    end

    field :bot_task, Types::BotTaskType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def bot_task(id:, lang:)
      object.bot_tasks.find(id)
    end

    def dashboard(range:, kind:)
      whitelist = %w[
        visits
        browser_name
        browser
        lead_os
        user_os
        user_country
        first_response_time
        incoming_messages
        outgoing_messages
        opened_conversations
        solved_conversations
        resolution_avg
      ]
      unless whitelist.include?(kind)
        raise 'no dashboard available at this address'
      end

      Dashboard.new(
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
