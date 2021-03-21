# frozen_string_literal: true

module Types
  class AppType < Types::PublicAppType
    field :state, String, null: true
    field :timezone, String, null: true
    field :config_fields, Types::JsonType, null: true
    field :preferences, Types::JsonType, null: true
    field :app_users, [Types::AppUserType], null: true
    field :team_schedule, Types::JsonType, null: true
    field :gather_social_data, Boolean, null: true
    field :register_visits, Boolean, null: true
    field :translations, [Types::JsonType], null: true
    field :outgoing_email_domain, String, null: true
    field :custom_fields, [Types::JsonType], null: true
    field :app_packages, [Types::AppPackageType], null: true
    field :agent_app_packages, [Types::AppPackageType], null: true
    field :editor_app_packages, [Types::AppPackageType], null: true
    field :follow_action_app_packages, [Types::AppPackageType], null: true
    field :tag_list, [Types::JsonType], null: true
    field :user_home_apps, [Types::JsonType], null: true
    field :inbox_apps, [Types::JsonType], null: true
    field :visitor_home_apps, [Types::JsonType], null: true
    field :plans, [Types::JsonType], null: true
    field :plan, Types::JsonType, null: true
    field :inbound_email_address, String, null: true
    field :outgoing_email_domain, String, null: true

    def plan
      return { disabled: true } unless context[:enabled_subscriptions]

      object.plan
    end

    def inbox_apps
      object.inbox_apps.blank? ? object.default_home_apps : object.inbox_apps
    end

    def plans
      PaymentServices::Paddle.new.get_plans
    end

    field :user_transactions, [Types::JsonType], null: true
    def user_transactions
      PaymentServices::Paddle.new.get_user_transactions(
        object.paddle_user_id
      )
    end

    field :subscription_transactions, [Types::JsonType], null: true
    def subscription_transactions
      PaymentServices::Paddle.new.get_subscription_transactions(
        object.paddle_subscription_id
      )
    end

    field :subscription_details, Types::JsonType, null: true
    def subscription_details
      PaymentServices::Paddle.new.get_subscription(
        object.paddle_subscription_id
      )
    end

    field :update_subscription_plan, Types::JsonType, null: true do
      argument :plan_id, Integer, required: true
    end

    def update_subscription_plan(plan_id:)
      PaymentServices::Paddle.new.update_subscription(
        object.paddle_subscription_id,
        plan_id: plan_id,
        passthrough: object.key
      )
    end

    field :subscriptions_enabled, Boolean, null: true
    def subscriptions_enabled
      context[:enabled_subscriptions]
    end

    def tag_list
      authorize! object, to: :show?, with: AppPolicy
      object.tag_list || []
    end

    field :event_types, [Types::JsonType], null: true
    field :outgoing_webhooks, [Types::JsonType], null: true

    def outgoing_webhooks
      # object.plan.allow_feature!('OutgoingWebhooks')
      authorize! object, to: :manage?, with: AppPolicy
      object.outgoing_webhooks
    end

    def event_types
      Event::EVENT_CONSTANTS
    end

    def editor_app_packages
      authorize! object, to: :show?, with: AppPolicy
      object.app_packages.tagged_with('editor')
            .joins(:app_package_integrations)
            .where('app_package_integrations.id is not null').uniq
    end

    field :agent_app_package, Types::AppPackageType, null: true do
      argument :id, String, required: true, default_value: ''
    end

    def agent_app_package(id:)
      # object.app_package_integrations.find(id)
      # object.app_packages.find_by(name: id)
      current_user.app_packages.find(id)
    end

    field :app_packages_capabilities, [Types::AppPackageIntegrationType], null: true do
      argument :kind, String, required: true, default_value: ''
    end

    def app_packages_capabilities(kind:)
      raise 'not in type' unless %w[home conversations bots inbox].include?(kind)

      authorize! object, to: :show?, with: AppPolicy

      object.app_package_integrations
            .joins(:app_package)
            .where(
              app_package_id: object.app_packages.tagged_with(kind, on: 'capabilities')
            ).order('app_packages.name desc')
    end

    def gather_social_data
      authorize! object, to: :show?, with: AppPolicy
      ActiveModel::Type::Boolean.new.cast(object.gather_social_data)
    end

    def register_visits
      authorize! object, to: :show?, with: AppPolicy
      ActiveModel::Type::Boolean.new.cast(object.register_visits)
    end

    def app_packages
      authorize! object, to: :manage?, with: AppPolicy
      integrations = object.app_package_integrations.map(&:app_package_id)
      if integrations.any?
        AppPackage.where.not('id in(?)', integrations)
      else
        AppPackage.all
      end
    end

    def agent_app_packages
      authorize! object, to: :manage?, with: AppPolicy
      current_user.app_packages
    end

    field :app_package_integrations, [Types::AppPackageIntegrationType], null: true

    def app_package_integrations
      # object.plan.allow_feature!('Integrations')
      authorize! object, to: :manage?, with: AppPolicy
      object.app_package_integrations
    end

    field :encryption_key, String, null: true

    def encryption_key
      # authorize! object, to: :manage?, with: AppPolicy
      object.encryption_key unless context[:from_api]
    end

    field :conversations, Types::PaginatedConversationsType, null: true do
      argument :page, Integer, required: false, default_value: 1
      argument :per, Integer, required: false, default_value: 20
      argument :sort, String, required: false
      argument :filter, String, required: false
      argument :agent_id, Integer, required: false
      argument :tag, String, required: false
      argument :term, String, required: false
    end

    field :conversations_counts, Types::JsonType, null: true

    field :conversations_tag_counts, Types::JsonType, null: true

    field :conversation, Types::ConversationType, null: true do
      argument :id, String, required: false
    end

    def conversations(per:, page:, filter:, sort:, agent_id: nil, tag: nil, term: nil)
      # object.plan.allow_feature!("Conversations")
      authorize! object, to: :show?, with: AppPolicy
      @collection = filter_by_agent(agent_id, filter)
      @collection = @collection.page(page).per(per)
      sort_conversations(sort)
      @collection = @collection.tagged_with(tag) if tag.present?
      # TODO: add _or_main_participant_name_cont, or do this with Arel
      if term
        @collection = @collection.ransack(
          messages_messageable_of_ConversationPartContent_type_text_content_cont: term
        ).result
      end

      @collection
    end

    def conversations_counts
      result = object.conversations.group('assignee_id').count.dup
      result.merge({
                     all: object.conversations.size
                   })
    end

    def conversations_tag_counts
      object.conversations.tag_counts.map do |o|
        { tag: o.name, count: o.taggings_count }
      end
    end

    def conversation(id:)
      authorize! object, to: :show?, with: AppPolicy
      object.conversations.find_by(key: id)
    end

    private def filter_by_agent(agent_id, filter)
      collection = object.conversations
                         .left_joins(:messages)
                         .where.not(conversation_parts: { id: nil })
                         .distinct

      collection = collection.where(state: filter) if filter.present?

      if agent_id.present?
        agent = agent_id.zero? ? nil : agent_id
        collection = collection.where(assignee_id: agent)
      end

      collection
    end

    private def sort_conversations(sort)
      if sort.present?
        s = case sort
            when 'newest' then 'updated_at desc'
            when 'oldest' then 'updated_at asc'
            when 'priority_first' then 'priority asc, updated_at desc'
            else
              'id desc'
            end

        if sort != 'unfiltered' # && agent_id.blank?
          @collection = @collection.where
                                   .not(latest_user_visible_comment_at: nil)
        end

        @collection = @collection.order(s)
      end
    end

    field :app_user, Types::AppUserType, null: true do
      argument :id, Integer, required: false
    end

    def app_user(id:)
      authorize! object, to: :show?, with: AppPolicy
      object.app_users.find(id)
    end

    field :campaigns, Types::PaginatedCampaignType, null: true do
      argument :mode, String, required: false
    end

    def campaigns(mode:)
      # object.plan.allow_feature!(mode.classify.pluralize)
      authorize! object, to: :show?, with: AppPolicy
      collection = object.send(mode) if Message.allowed_types.include?(mode)
      collection.page(1).per(20)
    end

    field :campaign, Types::CampaignType, null: true do
      argument :mode, String, required: false
      argument :id, String, required: false
    end

    def campaign(mode:, id:)
      authorize! object, to: :show?, with: AppPolicy
      collection = object.send(mode) if Message.allowed_types.include?(mode)
      collection.find(id)
    end

    field :agents, [Types::AgentType], null: false

    def agents
      authorize! object, to: :show?, with: AppPolicy
      object.agents.with_attached_avatar.where(invitation_token: nil)
    end

    field :role_agents, [Types::RoleType], null: false

    def role_agents
      authorize! object, to: :show?, with: AppPolicy
      object.roles
    end

    field :not_confirmed_agents, [Types::AgentType], null: false

    def not_confirmed_agents
      authorize! object, to: :show?, with: AppPolicy
      object.agents.invitation_not_accepted
    end

    field :agent, Types::AgentType, null: false do
      argument :id, Integer, required: true
    end

    def agent(id:)
      authorize! object, to: :show?, with: AppPolicy
      object.agents.find(id)
    end

    field :segments, [Types::SegmentType], null: true

    def segments
      # object.plan.allow_feature!('Segments')
      authorize! object, to: :show?, with: AppPolicy
      Segment.union_scope(
        object.segments.all, Segment.where('app_id is null')
      ).order('id asc')
    end

    field :segment, Types::SegmentType, null: true do
      argument :id, Integer, required: true
    end

    def segment(id:)
      authorize! object, to: :show?, with: AppPolicy
      s = Segment.where('app_id is null ').where(id: id).first
      s.present? ? s : object.segments.find(id)
    end

    field :assignment_rules, [Types::AssignmentRuleType], null: true

    def assignment_rules
      # object.plan.allow_feature!('AssignmentRules')
      authorize! object, to: :show?, with: AppPolicy
      object.assignment_rules.order('priority asc')
    end

    field :quick_replies, [Types::QuickReplyType], null: true do
      argument :lang, String, required: false, default_value: I18n.default_locale
      argument :q, String, required: false, default_value: nil
    end

    def quick_replies(lang:, q:)
      I18n.locale = lang
      authorize! object, to: :show?, with: AppPolicy
      if q.present?
        return object.quick_replies
                     .ransack(title_cont: q)
                     .result(distinct: true)
      end

      object.quick_replies
    end

    field :quick_reply, Types::QuickReplyType, null: true do
      argument :id, Integer, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale
    end

    def quick_reply(id:, lang:)
      I18n.locale = lang
      authorize! object, to: :show?, with: AppPolicy
      object.quick_replies.find(id)
    end

    field :articles, Types::PaginatedArticlesType, null: true do
      argument :page, Integer, required: true
      argument :per, Integer, required: false, default_value: 6
      argument :lang, String, required: false, default_value: I18n.default_locale
      argument :mode, String, required: false, default_value: 'all'
      argument :search, String, required: false, default_value: nil
    end

    def articles(page:, per:, lang:, mode:, search:)
      # object.plan.allow_feature!('Articles')
      authorize! object, to: :show?, with: AppPolicy
      I18n.locale = lang
      if mode == 'all'
        articles = object.articles
      elsif mode == 'published'
        articles = object.articles.published
      elsif mode == 'draft'
        articles = object.articles.draft
      end

      articles = object.articles.search(search) if search.present?

      articles.page(page).per(per)
    end

    field :articles_uncategorized, Types::PaginatedArticlesType, null: true do
      argument :page, Integer, required: true
      argument :per, Integer, required: false, default_value: 20
      argument :lang, String, required: false, default_value: I18n.default_locale
    end

    def articles_uncategorized(page:, per:, lang:)
      # object.plan.allow_feature!('Articles')
      I18n.locale = lang
      authorize! object, to: :show?, with: AppPolicy
      object.articles.without_collection.page(page).per(per)
    end

    field :article, Types::ArticleType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def article(id:, lang:)
      # object.plan.allow_feature!('Articles')
      I18n.locale = lang
      authorize! object, to: :show?, with: AppPolicy
      object.articles.friendly.find(id)
    end

    field :collections, [Types::CollectionType], null: true do
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def collections(lang:)
      # object.plan.allow_feature!('Articles')
      I18n.locale = lang.to_sym
      authorize! object, to: :show?, with: AppPolicy
      object.article_collections
    end

    field :collection, Types::CollectionType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def collection(id:, lang:)
      authorize! object, to: :show?, with: AppPolicy
      I18n.locale = lang.to_sym
      object.article_collections.friendly.find(id)
    end

    field :bot_tasks, [Types::BotTaskType], null: true do
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
      argument :mode, String, required: false, default_value: 'outbound'
      argument :filters, Types::JsonType, required: false, default_value: {}
    end

    def bot_tasks(lang:, mode:, filters:)
      # object.plan.allow_feature!('BotTasks')
      authorize! object, to: :show?, with: AppPolicy

      object.bot_tasks

      collection = object.bot_tasks.for_new_conversations if mode == 'new_conversations'

      collection = object.bot_tasks.for_outbound if mode == 'outbound'

      collection = collection.where(state: filters['state']) if filters['state'].present?

      handle_bot_tasks_filters(filters, collection).ordered
    end

    private def handle_bot_tasks_filters(filters, collection)
      return collection if filters['users'].blank?

      ors = nil
      filters['users'].each_with_index do |filter, _index|
        ors = ors.nil? ? BotTask.infix(filter) : ors.or(BotTask.infix(filter))
      end
      collection = collection.where(ors) if ors.present?
    end

    field :bot_task, Types::BotTaskType, null: true do
      argument :id, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale.to_s
    end

    def bot_task(id:, lang:)
      authorize! object, to: :show?, with: AppPolicy
      object.bot_tasks.find(id)
    end

    def dashboard(range:, kind:)
      authorize! object, to: :show?, with: AppPolicy

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
        app_packages
      ]
      raise 'no dashboard available at this address' unless whitelist.include?(kind)

      Dashboard.new(
        app: object,
        range: range
      ).send(kind)
    end

    field :dashboard, Types::JsonType, null: true do
      argument :range, Types::JsonType, required: true
      argument :kind,  String, required: true
    end

    # OAUTH
    field :oauth_applications, [OauthApplicationType], null: true
    def oauth_applications
      # object.plan.allow_feature!('OauthApplications')
      authorize! object, to: :manage?, with: AppPolicy
      object.oauth_applications.ordered_by(:created_at)
    end

    field :oauth_application, OauthApplicationType, null: true do
      argument :uid, String, required: false
    end

    def oauth_application(uid:)
      authorize! object, to: :manage?, with: AppPolicy
      object.oauth_applications.find_by(uid: uid)
    end

    field :authorized_oauth_applications, [OauthApplicationType], null: true
    def authorized_oauth_applications
      authorize! object, to: :manage?, with: AppPolicy
      object.oauth_applications.authorized_for(current_user)
    end
  end
end
