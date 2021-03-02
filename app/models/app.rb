# frozen_string_literal: true

require 'dummy_name'

class App < ApplicationRecord
  include GlobalizeAccessors
  include Tokenable

  store :preferences, accessors: %i[
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
    paddle_user_id
    paddle_subscription_id
    paddle_subscription_plan_id
    paddle_subscription_status
    privacy_consent_required
  ], coder: JSON

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
  has_one :article_settings, class_name: 'ArticleSetting', dependent: :destroy_async
  has_many :articles, dependent: :destroy_async
  has_many :article_collections, dependent: :destroy_async
  has_many :sections, through: :article_collections
  has_many :conversations, dependent: :destroy_async
  has_many :conversation_parts, through: :conversations, source: :messages
  has_many :segments, dependent: :destroy_async
  has_many :roles, dependent: :destroy_async
  has_many :agents, through: :roles
  has_many :campaigns, dependent: :destroy_async
  has_many :user_auto_messages, dependent: :destroy_async
  has_many :tours, dependent: :destroy_async
  has_many :banners, dependent: :destroy_async
  has_many :messages, dependent: :destroy_async
  has_many :bot_tasks, dependent: :destroy_async
  has_many :assignment_rules, dependent: :destroy_async
  has_many :outgoing_webhooks, dependent: :destroy_async
  has_many :oauth_applications, class_name: 'Doorkeeper::Application', as: :owner, dependent: :destroy_async
  belongs_to :owner, class_name: 'Agent', optional: true # , foreign_key: "owner_id"

  has_one_attached :logo

  before_create :set_defaults
  after_create :create_agent_bot, :init_app_segments, :attach_default_packages

  accepts_nested_attributes_for :article_settings

  validates :name, presence: true
  validates :domain_url, presence: true

  def agent_bots
    agents.where('bot =?', true)
  end

  def attach_default_packages
    default_packages = %w[ContentShowcase ArticleSearch Qualifier InboxSections]
    AppPackage.where(name: default_packages).each do |app_package|
      app_packages << app_package unless app_package_integrations.exists?(
        app_package_id: app_package.id 
      )
    end
  end

  def encryption_enabled?
    encryption_key.present?
  end

  def outgoing_email_domain
    self.preferences[:outgoing_email_domain].present? ?
      self.preferences[:outgoing_email_domain] :
      ENV['DEFAULT_OUTGOING_EMAIL_DOMAIN']
  end

  def config_fields
    [
      {
        name: 'name',
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'domainUrl',
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' }
      },

      {
        name: 'outgoingEmailDomain',
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-1/2' }
      },

      {
        name: 'state',
        type: 'select',
        grid: { xs: 'w-full', sm: 'w-1/2' },
        options: %w[enabled disabled]
      },

      { name: 'activeMessenger',
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-1/2' } },

      {
        name: 'theme',
        type: 'select',
        options: %w[dark light],
        grid: { xs: 'w-full', sm: 'w-1/2' }
      },

      {
        name: 'encryptionKey',
        type: 'string',
        maxLength: 16, minLength: 16,
        placeholder: 'leave it blank for no encryption',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      { name: 'tagline',
        type: 'text',
        hint: 'messenger text on botton',
        grid: { xs: 'w-full', sm: 'w-full' } },

      { name: 'timezone',
        type: 'timezone',
        options: ActiveSupport::TimeZone.all.map { |o| o.tzinfo.name },
        multiple: false,
        grid: { xs: 'w-full', sm: 'w-full' } }

    ]
  end

  def add_anonymous_user(attrs)
    session_id = attrs.delete(:session_id)
    callbacks = attrs.delete(:disable_callbacks) 

    next_id = attrs[:name].blank? ? "visitor #{DummyName::Name.new}" : attrs[:name]

    unless attrs.dig(:properties, :name).present?
      attrs.merge!(
        name: "#{next_id}"
      )
    end

    ap = app_users.visitors.find_or_initialize_by(session_id: session_id)
    ap.disable_callbacks = true if callbacks.present?
    ap = handle_app_user_params(ap, attrs)
    ap.generate_token
    ap.save
    ap
  end

  def add_lead(attrs)
    email = attrs.delete(:email)
    callbacks = attrs.delete(:disable_callbacks) 
    ap = app_users.leads.find_or_initialize_by(email: email)
    ap = handle_app_user_params(ap, attrs)
    ap.disable_callbacks = true if callbacks.present?
    data = attrs.deep_merge!(properties: ap.properties)
    ap.generate_token
    ap.save
    ap
  end

  def add_user(attrs)
    email = attrs.delete(:email)

    callbacks = attrs.delete(:disable_callbacks) 
    # page_url = attrs.delete(:page_url)
    ap = app_users.find_or_initialize_by(email: email)
    ap.disable_callbacks = true if callbacks.present?

    ap = handle_app_user_params(ap, attrs)
    ap.last_visited_at = attrs[:last_visited_at] if attrs[:last_visited_at].present?
    ap.subscribe! unless ap.subscribed?
    ap.type = 'AppUser'
    ap.save
    ap
  end

  def handle_app_user_params(ap, attrs)
    attrs = { properties: attrs } unless attrs.key?(:properties)
    
    keys = attrs[:properties].keys & app_user_updateable_fields
    data_keys  = attrs[:properties].slice(*keys)

    property_keys = attrs[:properties].keys - keys
    property_params = attrs[:properties].slice(*property_keys)
  
    data = { properties: ap.properties.merge(property_params) }
    ap.assign_attributes(data)
    ap.assign_attributes(data_keys)
    ap
  end

  def add_agent(attrs, bot: nil, role_attrs: {})
    email = attrs.delete(:email)
    user = Agent.find_or_initialize_by(email: email)
    # user.skip_confirmation!
    if user.new_record?
      user.password = attrs[:password] || Devise.friendly_token[0, 20]
      user.save
    end

    role = roles.find_or_initialize_by(agent_id: user.id, role: role)
    data = attrs.deep_merge!(properties: user.properties)

    user.assign_attributes(data)
    user.bot = bot
    user.save

    # role.last_visited_at = Time.now
    role.assign_attributes(role_attrs)
    role.save
    role
  end

  def add_bot_agent(attrs)
    add_agent(attrs, bot: true)
  end

  def get_non_users_by_session(session_id)
    self.app_users.non_users.find_by(session_id: session_id)
  end

  def get_app_user_by_email(email)
    self.app_users.users.find_by(email: email)
  end

  def create_agent_bot
    add_bot_agent(email: "bot@#{id}-chaskiq", name: 'chaskiq bot')
  end

  def add_admin(attrs)
    add_agent(
      {
        email: attrs[:email],
        password: attrs[:password]
      },
      bot: nil,
      role_attrs: { access_list: ['manage'] }
    )
  end

  def add_visit(opts = {})
    add_user(opts.merge(last_visited_at: Time.zone.now))
  end

  def start_conversation(options)
    message = options[:message]
    user = options[:from]
    participant = options[:participant] || user
    message_source = options[:message_source]

    conversation = conversations.create(
      main_participant: participant,
      initiator: user,
      assignee: options[:assignee]
    )

    conversation.add_message(
      from: user,
      message: message,
      message_source: message_source,
      check_assignment_rules: true
    ) unless message.blank?

    conversation.add_started_event
    conversation
  end

  def query_segment(kind)
    predicates = inbound_settings[kind]['predicates']
    segment = segments.new
    segment.assign_attributes(predicates: inbound_settings[kind]['predicates'])
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
  rescue #Biz::Error::Configuration
    nil
  end

  def in_business_hours?(time)
    availability.in_hours?(time)
  rescue #Biz::Error::Configuration
    nil
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
      .where('app_packages.name =?', name)
      .first
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
    return '' unless logo_blob.present?

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

  def app_user_updateable_fields
    (custom_fields || []) + AppUser::ALLOWED_PROPERTIES + AppUser::ACCESSOR_PROPERTIES 
  end

  def searcheable_fields_list
    searcheable_fields.map { |o| o['name'] }
  end

  def default_home_apps
    pkg_id = app_package_integrations
    .joins(:app_package)
    .where(
      "app_packages.name": 'InboxSections'
    ).first.id rescue nil

    pkg_id.present? ? [
      {"hooKind"=>"initialize", 
        "definitions"=>[{"type"=>"content"}], 
        "values"=>{"block_type"=>"user-blocks"}, 
        "id"=> pkg_id, 
        "name"=>"InboxSections"
      }, 
      {"hooKind"=>"initialize", 
        "definitions"=>[{"type"=>"content"}], 
        "values"=>{"block_type"=>"user-properties-block"}, 
        "id"=> pkg_id, 
        "name"=>"InboxSections"
    }] : []
  end

  def plan
    if paddle_subscription_status == 'active' || paddle_subscription_status == 'trialing'
      @plan ||= Plan.new(
        Plan.get_by_id(paddle_subscription_plan_id.to_i) || Plan.get('free')
      )
    else
      @plan = Plan.get('free')
    end
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
        segment: 'all'
      },
      visitors: {
        enabled: true,
        segment: 'all'
      }
    }
    self.team_schedule = []
    generate_encryption_key if encryption_key.blank?
  end

  def hours_format
    h = {}
    arr = team_schedule || []
    arr.map do |f|
      h[f['day'].to_sym] = (h[f['day'].to_sym] || {}).merge!(f['from'] => f['to'])
    end
    h
  end
end
