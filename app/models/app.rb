# frozen_string_literal: true

require "dummy_name"

class App < ApplicationRecord
  include GlobalizeAccessors
  include Tokenable
  include UserHandler
  include Notificable
  include Subscribable

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
    searcheable_fields.map { |o| o["name"] }
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





  ### JSON DATA OBJECTS ###
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

    @inbound_settings_objects ||= InboundSettingsRecord.new(inbound_settings)
  end

  def inbound_settings_attributes=(attributes)
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
    date = Date.today
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

class InboundSettingsRecord
  include ActiveModel::Model

  attr_accessor :enabled,
                :users_enabled,
                :users_segment,
                :users_predicates,
                :visitors_enabled,
                :visitors_segment,
                :visitors_predicates

  def initialize(options)
    self.enabled = options["enabled"]
    self.users_enabled = options.dig("users", "enabled")
    self.users_segment = options.dig("users", "segment")
    self.users_predicates = options.dig("users", "predicates") || []

    self.visitors_enabled = options.dig("visitors", "enabled")
    self.visitors_segment = options.dig("visitors", "segment")
    self.visitors_predicates = options.dig("users", "predicates") || []
  end

  def marked_for_destruction?
    false
  end

  def new_record?
    true
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
    "https://www.toptal.com/designers/subtlepatterns/patterns/"
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
