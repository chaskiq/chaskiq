# frozen_string_literal: true

require 'digest/md5'

class AppUser < ApplicationRecord
  include AASM
  include UnionScope
  include Tokenable
  include Redis::Objects

  ENABLED_SEARCH_FIELDS = [
    { 'name' => 'email', 'type' => 'string' },
    { 'name' => 'postal', 'type' => 'string' },
    { 'name' => 'name', 'type' => 'string' },
    { 'name' => 'first_name', 'type' => 'string' },
    { 'name' => 'last_name', 'type' => 'string' },
    { 'name' => 'company_name', 'type' => 'string' },
    { 'name' => 'company_size', 'type' => 'string' },
    { 'name' => 'phone', 'type' => 'string' }
  ].freeze

  BROWSING_FIELDS = [
    { 'name' => 'lang', 'type' => 'string' },
    { 'name' => 'type', 'type' => 'string' },
    { 'name' => 'last_visited_at', 'type' => 'date' },
    { 'name' => 'tags', 'type' => 'string' },
    { 'name' => 'referrer', 'type' => 'string' },
    { 'name' => 'state', 'type' => 'string' },
    { 'name' => 'ip', 'type' => 'string' },
    { 'name' => 'city', 'type' => 'string' },
    { 'name' => 'region', 'type' => 'string' },
    { 'name' => 'country', 'type' => 'string' },
    { 'name' => 'lat', 'type' => 'string' },
    { 'name' => 'lng', 'type' => 'string' },
    { 'name' => 'web_sessions', 'type' => 'string' },
    { 'name' => 'timezone', 'type' => 'string' },
    { 'name' => 'browser', 'type' => 'string' },
    { 'name' => 'browser_version', 'type' => 'string' },
    { 'name' => 'os', 'type' => 'string' },
    { 'name' => 'os_version', 'type' => 'string' },
    { 'name' => 'browser_language', 'type' => 'string' }
  ].freeze

  attr_accessor :disable_callbacks

  # belongs_to :user
  belongs_to :app
  has_many :conversations, foreign_key: :main_participant_id, dependent: :destroy
  # has_many :metrics , as: :trackable
  has_many :metrics, dependent: :destroy
  has_many :visits, dependent: :destroy
  has_many :external_profiles, dependent: :destroy

  acts_as_taggable_on :tags

  include Eventable

  after_create :add_created_event

  after_save :enqueue_social_enrichment, if: :saved_change_to_email?

  ALLOWED_PROPERTIES = [
    :ip, 
    :city, 
    :region, 
    :country, 
    :session_id, 
    :email, 
    :lat,
    :lng,
    :postal, 
    :web_sessions, 
    :timezone, 
    :browser, 
    :browser_version, 
    :os, 
    :os_version, 
    :browser_language, 
    :lang, 
    :created_at,
    :updated_at,
    :last_seen, 
    :first_seen, 
    :signed_up, 
    :last_contacted, 
    :last_heard_from
  ]

  ACCESSOR_PROPERTIES = [
    :name,
    :first_name,
    :last_name,
    #:country,
    :country_code,
    #:region,
    :region_code,
    :facebook,
    :twitter,
    :linkedin,
    :gender,
    :organization,
    :job_title,
    :phone,
    :company_name,
    :company_size,
    :privacy_consent
  ]

  store_accessor :properties, ACCESSOR_PROPERTIES

  ACCESSOR_PROPERTIES.each do |prop|
    ransacker prop do |parent|
      Arel::Nodes::InfixOperation.new('->>', parent.table[:properties], Arel::Nodes.build_quoted(prop))
    end
  end

  scope :availables, lambda {
    where(['app_users.subscription_state =? or app_users.subscription_state=?',
           'passive', 'subscribed'])
  }

  scope :visitors, lambda {
    where(type: 'Visitor')
  }

  scope :leads, lambda {
    where(type: 'Lead')
  }

  scope :users, lambda {
    where(type: 'AppUser')
  }

  # from redis-objects
  counter :new_messages
  value :trigger_locked, expireat: -> { Time.now + 5.seconds }

  aasm column: :subscription_state do # default column: aasm_state
    state :passive, initial: true
    state :subscribed, after_enter: :notify_subscription
    state :unsubscribed, after_enter: :notify_unsubscription
    state :archived # , after_enter: :notify_archived
    state :blocked # , after_enter: :notify_bloqued

    event :subscribe do
      transitions from: %i[passive unsubscribed archived blocked], to: :subscribed
    end

    event :unsubscribe do
      transitions from: %i[subscribed passive archived blocked passive], to: :unsubscribed
    end

    event :block do
      transitions from: %i[archived subscribed unsubscribed passive], to: :blocked
    end

    event :archive do
      transitions from: %i[blocked subscribed unsubscribed passive], to: :archived
    end
  end

  def delay_for_trigger
    settings = is_a?(AppUser) ? app.user_tasks_settings : app.lead_tasks_settings
    delay = settings['delay'] ? 2.minutes.from_now : 0.minutes.from_now
  end

  def available?
    %w[passive subscribed].include?(subscription_state)
  end

  def calbackable?
    !@disable_callbacks
  end

  def add_created_event
    return unless calbackable?
    events.log(action: :user_created)
  end

  def add_email_changed_event
    return unless calbackable?
    events.log(action: :email_changed)
  end

  def lead_event
    return unless calbackable?
    events.log(action: :visitors_convert)
  end

  def display_name
    [name].join(' ')
  end

  def session_key
    "#{app.key}-#{session_id}"
  end

  def generate_token
    self.session_id = loop do
      random_token = SecureRandom.urlsafe_base64(nil, false)
      break random_token unless app.app_users.where(session_id: random_token).any?
    end
  end

  # delegate :email, to: :user

  def as_json(options = nil)
    super({
      only: %i[id kind display_name avatar_url],
      methods: %i[id kind display_name avatar_url]
    }.merge(options || {}))
  end

  def offline?
    !state || state == 'offline'
  end

  def online?
    state == 'online'
  end

  def channel_key
    "presence:#{app.key}-#{email}"
  end

  def online!
    self.state = 'online'
    self.last_visited_at = Time.now

    if save
      ActionCable.server.broadcast(channel_key, to_json) # not necessary
      ActionCable.server.broadcast("events:#{app.key}",
                                   type: 'presence',
                                   data: formatted_user)
    end
  end

  def offline!
    self.state = 'offline'
    if save
      ActionCable.server.broadcast("events:#{app.key}",
                                   type: 'presence',
                                   data: formatted_user)
    end
  end

  def formatted_user
    {
      id: id,
      email: email,
      properties: properties,
      state: state
    }
  end

  def notify_unsubscription
    # puts 'app user unsubscribe'
  end

  def notify_subscription
    # we should only unsubscribe when process is made from interface, not from sns notification
    # puts 'app user subscribe'
  end

  %w[open send delivery reject bounce complaint click close skip finish].each do |action|
    define_method("track_#{action}") do |opts|
      m = metrics.new
      m.assign_attributes(opts)
      m.action = action
      m.save
      m
    end
  end

  def encoded_id
    return nil if email.blank?

    URLcrypt.encode(email)
  end

  def decoded_id
    return nil if email.blank?

    URLcrypt.decode(email)
  end

  def avatar_url
    ui_avatar_url = "https://ui-avatars.com/api/#{URI.encode_www_form_component(display_name)}/128"
    return "#{ui_avatar_url}/f5f5dc/888/4" if email.blank?
    email_address = email.downcase
    hash = Digest::MD5.hexdigest(email_address)
    image_src = "https://www.gravatar.com/avatar/#{hash}?d=#{ui_avatar_url}/7fffd4"
  end

  def kind
    self.class.model_name.singular
  end

  def style_class
    case state
    when 'passive'
      'plain'
    when 'subscribed'
      'information'
    when 'unsusbscribed'
      'warning'
    end
  end

  def enqueue_social_enrichment
    return unless calbackable?
    add_email_changed_event
  end

  def register_visit(options)
    visits.register(options, app.register_visits)
  end

  def register_in_crm
    crm_tags = app.app_packages.tagged_with('crm').pluck(:id)
    integrations = app.app_package_integrations.includes(:app_package)
                      .where(app_package: crm_tags)

    integrations.each do |_integration|
      profile = external_profiles.find_or_create_by(
        provider: pkg.name.downcase
      )
      profile.sync
    end
  end
end
