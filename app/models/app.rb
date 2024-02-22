# frozen_string_literal: true

require "dummy_name"

class App < ApplicationRecord
  include GlobalizeAccessors
  include Tokenable
  include UserHandler
  include Notificable
  include Subscribable

  attr_accessor :new_language

  store_accessor :preferences, %i[
    active_messenger
    domain_url
    theme
    email_requirement
    inbound_settings
    lead_tasks_settings
    user_tasks_settings
    timezone
    reply_time
    team_schedule
    gather_social_data
    customization_colors
    outgoing_email_domain
    register_visits
    custom_fields
    inline_new_conversations
    tag_list
    user_home_apps
    visitor_home_apps
    inbox_apps
    profile_apps

    paddle_user_id
    paddle_subscription_id
    paddle_subscription_plan_id
    paddle_subscription_status

    stripe_customer_id
    stripe_subscription_id
    stripe_subscription_plan_id
    stripe_subscription_status

    privacy_consent_required
    inbound_email_address
    avatar_settings

    agent_editor_settings
    user_editor_settings
    lead_editor_settings

    sorted_agents

    flagged
  ]

  include InboundAddress

  translates :greetings, :intro, :tagline
  globalize_accessors attributes: %i[
    greetings
    intro
    tagline
  ]

  # http://nandovieira.com/using-postgresql-and-jsonb-with-ruby-on-rails
  # App.where('preferences @> ?', {notifications: true}.to_json)

  has_many :app_users, dependent: :destroy_async
  has_many :external_profiles, through: :app_users
  has_many :visits, through: :app_users, dependent: :destroy_async
  has_many :quick_replies, dependent: :destroy_async
  has_many :app_package_integrations, dependent: :destroy_async
  has_many :app_packages, through: :app_package_integrations
  has_one :article_settings, class_name: "ArticleSetting", dependent: :destroy_async
  has_many :articles, dependent: :destroy_async
  has_many :article_collections, dependent: :destroy_async
  has_many :sections, through: :article_collections
  has_many :conversations, dependent: :destroy_async
  has_many :conversation_channels, through: :conversations
  has_many :conversation_parts, through: :conversations, source: :messages
  has_many :conversation_events, through: :conversations, source: :events
  has_many :segments, dependent: :destroy_async
  has_many :roles, dependent: :destroy_async
  has_many :agents, through: :roles
  has_many :teams, dependent: :destroy_async
  has_many :agent_teams, through: :teams
  has_many :campaigns, dependent: :destroy_async
  has_many :user_auto_messages, dependent: :destroy_async
  has_many :tours, dependent: :destroy_async
  has_many :audits, dependent: :destroy_async
  has_many :banners, dependent: :destroy_async
  has_many :messages, dependent: :destroy_async
  has_many :bot_tasks, dependent: :destroy_async
  has_many :assignment_rules, dependent: :destroy_async
  has_many :outgoing_webhooks, dependent: :destroy_async
  has_many :oauth_applications, class_name: "Doorkeeper::Application", as: :owner, dependent: :destroy_async
  belongs_to :owner, class_name: "Agent", optional: true # , foreign_key: "owner_id"

  has_one_attached :logo

  before_create :set_defaults
  after_create :create_agent_bot, :init_app_segments, :attach_default_packages

  accepts_nested_attributes_for :article_settings

  validates :name, presence: true
  validates :domain_url, presence: true

  def agent_bots
    agents.where("bot =?", true)
  end

  def default_packages
    %w[ContentShowcase ArticleSearch Qualifier InboxSections ContactFields]
  end

  def attach_default_packages
    AppPackage.where(name: default_packages).find_each do |app_package|
      app_packages << app_package unless app_package_integrations.exists?(
        app_package_id: app_package.id
      )
    end
  end

  def inline_new_conversations_value
    ActiveModel::Type::Boolean.new.cast(inline_new_conversations)
  end

  def packages_integrations_in_use
    app_package_integrations.joins(:app_package).where.not("app_packages.name" => default_packages)
  end

  def disable_packages_in_use!
    packages_integrations_in_use.delete_all
  end

  def encryption_enabled?
    encryption_key.present?
  end

  def outgoing_email_domain
    preferences[:outgoing_email_domain].presence || Chaskiq::Config.get("DEFAULT_OUTGOING_EMAIL_DOMAIN")
  end

  def searchkick_enabled?
    @searchkick_enabled ||= plan.enabled?("SearchIndex")
  end

  def inbound_conversations_enabled_for?(app_user)
    k = app_user.model_name.name === "AppUser" ? "users" : "visitors"
    inbound_settings.dig(k, "enabled_inbound")
  end

  def inbound_replies_closed_for?(app_user)
    namespace = app_user.model_name.name === "AppUser" ? "users" : "visitors"

    inbound_settings = self.inbound_settings[namespace]
    # if this option is not enabled then replies are allowed
    return false unless inbound_settings["close_conversations_enabled"]

    # if this is not a number assume closed
    return true unless inbound_settings["close_conversations_after"].is_a?(Numeric)

    # if zero we assume closed
    return true if inbound_settings["close_conversations_after"].zero?

    now = Time.zone.now
    closed_at_date = Time.zone.parse(conversation.closed_at)

    diff = (now - closed_at_date) / (24 * 60 * 60)

    # if diff is greater than setting assume closed
    diff.ceil >= inbound_settings["close_conversations_after"]
  end

  def config_fields
    [
      {
        name: "name",
        type: "string",
        grid: { xs: "w-full", sm: "w-full" }
      },

      {
        name: "domainUrl",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" }
      },

      {
        name: "outgoingEmailDomain",
        type: "string",
        grid: { xs: "w-full", sm: "w-1/2" }
      },

      {
        name: "state",
        type: "select",
        grid: { xs: "w-full", sm: "w-1/2" },
        options: %w[enabled disabled]
      },

      { name: "activeMessenger",
        type: "bool",
        grid: { xs: "w-full", sm: "w-1/2" } },

      {
        name: "theme",
        type: "select",
        options: %w[dark light],
        grid: { xs: "w-full", sm: "w-1/2" }
      },

      {
        name: "encryptionKey",
        type: "string",
        maxLength: 16, minLength: 16,
        placeholder: "leave it blank for no encryption",
        grid: { xs: "w-full", sm: "w-full" }
      },

      { name: "tagline",
        type: "text",
        hint: "messenger text on botton",
        grid: { xs: "w-full", sm: "w-full" } },

      { name: "timezone",
        type: "timezone",
        options: ActiveSupport::TimeZone.all.map { |o| o.tzinfo.name },
        multiple: false,
        grid: { xs: "w-full", sm: "w-full" } }

    ]
  end

  def start_conversation(options)
    message = options[:message]
    user = options[:from]
    participant = options[:participant] || user
    message_source = options[:message_source]

    ActiveRecord::Base.transaction do
      conversation = conversations.create(
        main_participant: participant,
        initiator: user,
        assignee: options[:assignee],
        subject: options[:subject]
      )

      if options[:initiator_channel]
        # here we will create a conversation channel and a external profile if it's neccessary
        pkg = find_app_package(options[:initiator_channel])
        pkg&.message_api_klass&.prepare_initiator_channel_for(conversation, pkg) if pkg.present?
      end

      if options[:initiator_block]
        pkg = find_app_package(options[:initiator_block]["name"])
        pkg&.message_api_klass&.prepare_block_initiator_channel_for(conversation, pkg, options[:initiator_block]) if pkg.present?
        message = nil
      end

      if message.present?
        conversation.add_message(
          from: user,
          message: message,
          message_source: message_source,
          check_assignment_rules: true
        )
      end

      conversation.add_started_event
      conversation
    end
  end

  def query_segment(kind)
    predicates = inbound_settings[kind]["predicates"]
    segment = segments.new
    segment.assign_attributes(predicates: inbound_settings[kind]["predicates"])
    app_users = segment.execute_query.availables
  end

  def availability
    @biz ||= Biz::Schedule.new do |config|
      config.hours = hours_format
      config.time_zone = timezone
    end
  end

  def business_back_in(time)
    a = availability.time(0, :hours).after(time)
    diff = a - time
    days = diff.to_f / (24 * 60 * 60)
    { at: a, diff: diff, days: days }
  rescue StandardError # Biz::Error::Configuration
    nil
  end

  def in_business_hours?(time)
    availability.in_hours?(time)
  rescue StandardError # Biz::Error::Configuration
    nil
  end

  def email
    if owner.present?
      owner.email
    else
      agents.humans.first.email
    end
  end

  def generate_encryption_key
    self.encryption_key = SecureRandom.hex(8)
  end

  def decrypt(data)
    json = JWE.decrypt(data, encryption_key)
    JSON.parse(json).deep_symbolize_keys
  rescue StandardError
    {}
  end

  def find_app_package(name)
    app_package_integrations
      .joins(:app_package)
      .find_by("app_packages.name =?", name)
  end

  def stats_for(name)
    AppIdentity.new(key).send(name).get
  end

  def stats_counts_for(name)
    AppIdentity.new(key).send(name).get.values.first
  rescue StandardError
    nil
  end

  def logo_url
    return "" if logo_blob.blank?

    url = begin
      logo.variant(resize_to_limit: [100, 100]).processed
    rescue StandardError
      nil
    end
    return nil if url.blank?

    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        url,
        only_path: false
      )
    rescue StandardError
      nil
    end
  end

  def searcheable_fields
    (custom_fields || []) + AppUser::ENABLED_SEARCH_FIELDS
  end

  def fields_for_segments
    (custom_fields || []) + AppUser::ENABLED_SEARCH_FIELDS + AppUser::BROWSING_FIELDS
  end

  def built_in_updateable_fields
    AppUser::ALLOWED_PROPERTIES + AppUser::ACCESSOR_PROPERTIES
  end

  def custom_field_keys
    custom_fields&.map { |o| o["name"].to_sym } || []
  end

  def app_user_updateable_fields
    (custom_fields || []) + built_in_updateable_fields
  end

  def searcheable_fields_list
    searcheable_fields.pluck("name")
  end

  def default_home_apps
    pkg_id = begin
      app_package_integrations
        .joins(:app_package)
        .find_by(
          "app_packages.name": "InboxSections"
        ).id
    rescue StandardError
      nil
    end

    if pkg_id.present?
      [
        { "hooKind" => "initialize",
          "definitions" => [{ "type" => "content" }],
          "values" => { "block_type" => "user-blocks" },
          "id" => pkg_id,
          "name" => "InboxSections" },
        { "hooKind" => "initialize",
          "definitions" => [{ "type" => "content" }],
          "values" => { "block_type" => "user-properties-block" },
          "id" => pkg_id,
          "name" => "InboxSections" }
      ]
    else
      []
    end
  end

  def allowed_editor_feature?(user_type, feature)
    kind = "agent" if user_type == "Agent"
    kind = user_type == "AppUser" ? "user" : "lead" if kind.blank?
    ActiveModel::Type::Boolean.new.cast preferences.dig("#{kind}_editor_settings", feature)
  end

  ### JSON DATA OBJECTS ###

  def avatar_settings_objects
    return AvatarSettings.new if avatar_settings.blank?

    @avatar_settings_objects ||= AvatarSettings.new(avatar_settings)
  end

  def avatar_settings_objects=(attrs)
    s = AvatarSettings.new(attrs)
    self.avatar_settings = {
      style: s.style, palette: s.palette_objects.map { |o| o.color.gsub("#", "") }
    }
  end

  def agent_editor_settings_objects
    return AgentEditorSettings.new if agent_editor_settings.blank?

    @agent_editor_settings_objects ||= AgentEditorSettings.new(agent_editor_settings)
  end

  def agent_editor_settings_objects=(attrs)
    self.agent_editor_settings = AgentEditorSettings.new(attrs)
  end

  def user_editor_settings_objects
    return AppUserEditorSettings.new if user_editor_settings.blank?

    @user_editor_settings_objects ||= AppUserEditorSettings.new(user_editor_settings)
  end

  def user_editor_settings_objects=(attrs)
    self.user_editor_settings = AppUserEditorSettings.new(attrs)
  end

  def lead_editor_settings_objects
    return AppUserEditorSettings.new if lead_editor_settings.blank?

    @lead_editor_settings_objects ||= AppUserEditorSettings.new(lead_editor_settings)
  end

  def lead_editor_settings_objects=(attrs)
    self.lead_editor_settings = AppUserEditorSettings.new(attrs)
  end

  def lead_tasks_settings_objects
    return LeadTasksSettings.new if lead_tasks_settings.blank?

    @lead_tasks_settings_objects ||= LeadTasksSettings.new(lead_tasks_settings)
  end

  def user_tasks_settings_objects
    return UserTasksSettings.new if user_tasks_settings.blank?

    @user_tasks_settings_objects ||= UserTasksSettings.new(user_tasks_settings)
  end

  def team_schedule_objects
    return [] if team_schedule.blank?

    @team_schedule_objects ||= team_schedule.map { |o| ScheduleRecord.new(o) }
  end

  def team_schedule_objects_attributes=(attributes)
    array = attributes.keys.map { |o| attributes[o] }
    self.team_schedule = JSON.parse(array.map { |o| ScheduleRecord.new(o) }.to_json)
    # array.map{|o| ScheduleRecord.new(o) }
  end

  def inbound_settings_objects
    return [] if inbound_settings.blank?

    inbound = inbound_settings
    inbound.delete("enabled")
    @inbound_settings_objects ||= InboundSettingsObjects.new(inbound)
  end

  def inbound_settings_objects_attributes=(attributes)
    inbound = inbound_settings

    if attributes["users_attributes"]
      object = InboundSettingsUserRecord.new(attributes["users_attributes"])
      inbound["users"] = object.as_json
    end

    if attributes["visitors_attributes"]
      object = InboundSettingsVisitorRecord.new(attributes["visitors_attributes"])
      inbound["visitors"] = object.as_json
    end

    self.inbound_settings = inbound
    # array = attributes.keys.map{|o| attributes[o] }
    # self.inbound_settings = JSON.parse(array.map{|o| ScheduleRecord.new(o) }.to_json)
    # array.map{|o| ScheduleRecord.new(o) }
  end

  def customization_colors_objects
    @customization_colors_objects ||= CustomizationRecord.new(customization_colors)
  end

  def customization_colors_attributes=(attributes)
    @customization_colors_objects = CustomizationRecord.new(attributes)
    self.customization_colors = @customization_colors_objects.as_json
  end

  def tag_list_objects
    return [] if tag_list.blank?

    @tag_list_objects ||= tag_list.map { |o| TagListRecord.new(o) }
  end

  def tag_list_objects_attributes=(attributes)
    array = attributes.keys.map { |o| attributes[o] }
    self.tag_list = array.map { |o| TagListRecord.new(o) }.as_json
  end

  def custom_fields_objects
    return [] if custom_fields.blank?

    @custom_fields_objects ||= custom_fields.map { |o| CustomFieldRecord.new(o) }
  end

  def custom_fields_objects_attributes=(attributes)
    array = attributes.keys.map { |o| attributes[o] }
    self.custom_fields = array.map { |o| CustomFieldRecord.new(o) }.as_json
  end

  private

  def init_app_segments
    SegmentFactory.create_segments_for(self)
  end

  def set_defaults
    self.user_tasks_settings = {}
    self.lead_tasks_settings = {}
    self.inbound_settings = {
      enabled: true,
      users: {
        enabled: true,
        segment: "all"
      },
      visitors: {
        enabled: true,
        segment: "all"
      }
    }
    self.team_schedule = []
    generate_encryption_key if encryption_key.blank?
  end

  def hours_format
    h = {}
    arr = team_schedule || []
    arr.map do |f|
      h[f["day"].to_sym] = (h[f["day"].to_sym] || {}).merge!(f["from"] => f["to"])
    end
    h
  end
end

class ScheduleRecord
  include ActiveModel::Model

  attr_accessor :day, :from, :to

  def marked_for_destruction?
    false
  end

  def self.hours_ranges
    date = Time.zone.today
    c = date.to_time.beginning_of_day
    (1..48).map do |_i|
      c += 30.minutes
      c.strftime("%H:%M")
    end
  end

  def new_record?
    true
  end
end

class InboundSettingsObjects
  include ActiveModel::Model

  attr_reader :users, :visitors

  def initialize(options)
    self.users = options["users"]
    self.visitors = options["visitors"]
  end

  def users=(options)
    @users = InboundSettingsUserRecord.new(options)
  end

  def visitors=(options)
    @visitors = InboundSettingsVisitorRecord.new(options)
  end

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end
end

class InboundSettingsVisitorRecord
  include ActiveModel::Model

  attr_accessor :enabled, :segment, :predicates, :enabled_inbound,
                :visitors_enable_inbound, :close_conversations_after,
                :close_conversations_enabled, :allow_idle_sessions, :idle_sessions_after

  def initialize(attributes = {})
    attributes.each do |name, value|
      send("#{name}=", value) if respond_to? name
    end
    self.enabled_inbound = ActiveModel::Type::Boolean.new.cast(attributes["enabled_inbound"]) if attributes["enabled_inbound"].present?
    self.enabled = ActiveModel::Type::Boolean.new.cast(attributes["enabled"]) if attributes["enabled"].present?
  end
end

class InboundSettingsUserRecord
  include ActiveModel::Model
  attr_accessor :enabled, :segment, :predicates, :enabled_inbound,
                :users_enable_inbound, :close_conversations_after,
                :close_conversations_enabled

  def initialize(attributes = {})
    attributes.each do |name, value|
      send("#{name}=", value) if respond_to? name
    end
    self.enabled_inbound = ActiveModel::Type::Boolean.new.cast(attributes["enabled_inbound"]) if attributes["enabled_inbound"].present?
    self.enabled = ActiveModel::Type::Boolean.new.cast(attributes["enabled"]) if attributes["enabled"].present?
  end
end

class CustomizationRecord
  include ActiveModel::Model

  attr_accessor :pattern, :primary, :secondary

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end

  def self.pattern_names
    %w[
      email-pattern
      5-dots
      greek-vase
      criss-cross
      chevron
      blue-snow
      let-there-be-sun
      triangle-mosaic
      dot-grid
      so-white
      cork-board
      hotel-wallpaper
      trees
      beanstalk
      fishnets-and-hearts
      lilypads
      floor-tile
      beige-tiles
      memphis-mini
      christmas-colour
      intersection
      doodles
      memphis-colorful
    ]
  end

  def self.pattern_base_url
    "https://storage.googleapis.com/subtlepatterns-production/designers/subtlepatterns/uploads/"
  end

  def self.patterns
    pattern_names.map do |o|
      {
        name: o,
        url: "#{pattern_base_url}#{o}.png"
      }
    end
  end
end

class TagListRecord
  include ActiveModel::Model

  attr_accessor :name, :color

  def self.table_name
    "taglist-record-tableless"
  end

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end
end

class CustomFieldRecord
  include ActiveModel::Model

  attr_accessor :name, :type, :validation

  def self.table_name
    "custom-field-tableless"
  end

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end
end

class AppUserEditorSettings
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :emojis,
                :gifs,
                :attachments
end

class AgentEditorSettings
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :images,
                :attachments,
                :giphy,
                :link_embeds,
                :embeds,
                :video_recorder,
                :app_packages,
                :routing_bots,
                :quick_replies,
                :bot_triggers,
                :divider
end

class LeadTasksSettings
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :assignee,
                :delay,
                :email_requirement,
                :override_with_task,
                :routing,
                :share_typical_time,
                :task_rules,
                :tasks_rules,
                :trigger
end

class UserTasksSettings
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :delay
end

class AvatarSettings
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :palette, :style

  def palette_objects=(colors)
    @palette_objects = colors.map { |o| AvatarPaletteColor.new(color: o) }
  end

  def palette_objects
    return @palette_objects if @palette_objects.present?

    colors = palette.presence || default_palette
    colors = colors.split(",") if colors.is_a?(String)

    @palette_objects = colors.map { |o| AvatarPaletteColor.new(color: o) }
  end

  def default_palette
    %i[fc284f ff824a fea887 f6e7f7 d1d0d7]
  end

  def self.style_options
    %w[
      marble
      beam
      pixel
      sunset
      ring
      bauhaus
    ]
  end

  def new_record?
    true
  end
end

class AvatarPaletteColor
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :color

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end
end
