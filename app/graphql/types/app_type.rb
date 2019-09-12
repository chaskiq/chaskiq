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
    field :encryption_key, String, null: true
    field :app_users, [Types::AppUserType], null: true
    #field :triggers, Types::JsonType, null: true
    field :team_schedule, Types::JsonType, null: true
    field :reply_time, String, null: true
    field :inbound_settings, Types::JsonType, null: true
    field :email_requirement, String, null: true
    field :greetings, String, null: true
    field :intro, String, null: true
    field :tagline, String, null: true
    field :user_tasks_settings, Types::JsonType, null: true
    field :lead_tasks_settings, Types::JsonType, null: true

    field :translations, [Types::JsonType], null: true
    field :available_languages, [Types::JsonType], null: true

    def available_languages
      object.translations.map(&:locale)
    end
    
    field :conversations, Types::PaginatedConversationsType, null:true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
      argument :sort, String, required: false
      argument :filter, String, required: false
    end

    def conversations(per: , page:, filter: ,sort:)
      @collection = object.conversations.left_joins(:messages)
                          .where.not(conversation_parts: {id: nil})
                          .distinct
                          .page(page)
                          .per(per)

      @collection = @collection.where(state: filter) if filter.present?
      
      if sort.present?
        s = case sort
          when "newest" then 'updated_at desc'
          when "oldest" then 'updated_at asc'
          when "priority-first" then 'priority asc, updated_at desc'
          else
            "id desc"
        end

        @collection = @collection.order( s ) 
      end

      @collection
    end

    field :in_business_hours, Boolean, null: true

    def in_business_hours
      object.in_business_hours?( Time.current )
    end

    field :business_back_in, Types::JsonType, null: true

    def business_back_in
      object.business_back_in(Time.current)
    end

    field :conversation, Types::ConversationType, null:true do
      argument :id, String, required: false
    end

    def conversation(id:)
      object.conversations.find_by(key: id)
    end

    field :app_user, Types::AppUserType, null:true do
      argument :id, Integer, required: false
    end

    def app_user(id:)
      object.app_users.find(id)
    end

    field :campaigns, Types::PaginatedCampaignType , null:true do
      argument :mode, String, required: false
    end

    def campaigns(mode:)
      collection = object.send(mode) if ["campaigns", "user_auto_messages", "tours" ].include?(mode)
      collection.page(1).per(20)
    end

    field :campaign, Types::CampaignType, null:true do
      argument :mode, String, required: false
      argument :id, Integer, required: false
    end

    def campaign(mode:, id:)
      collection = object.send(mode) if ["campaigns", "user_auto_messages", "tours" ].include?(mode)
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
        object.segments.all, Segment.where("app_id is null")
      ).order("id asc")
    end

    field :segment , Types::SegmentType, null: true do 
      argument :id, Integer, required: true
    end

    def segment(id:)
      s = Segment.where("app_id is null ").where(id: id).first
      s.present? ? s : object.segments.find(id)
    end

    field :assignment_rules, [Types::AssignmentRuleType], null: true

    def assignment_rules
      object.assignment_rules.order("priority asc")
    end

    field :article_settings, Types::ArticleSettingsType, null: true 

    def article_settings
      object.article_settings.blank? ? object.build_article_settings : object.article_settings
    end

    field :articles, Types::PaginatedArticlesType, null: true do
      argument :page, Integer, required: true
      argument :per, Integer, required: false, default_value: 20
      argument :lang, String, required: false, default_value: I18n.default_locale
    end

    def articles(page:, per:, lang:)
      I18n.locale = lang
      object.articles.page(page).per(per)
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
    end

    def bot_tasks(lang:)
      object.bot_tasks
    end

    field :bot_task, Types::BotTaskType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def bot_task(id:, lang:)
      object.bot_tasks.find(id)
    end


  end
end
