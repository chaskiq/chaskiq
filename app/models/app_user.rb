# frozen_string_literal: true

require 'URLcrypt'
require 'digest/md5'

class AppUser < ApplicationRecord
  include AASM
  include UnionScope
  include Tokenable
  include Redis::Objects

  ENABLED_SEARCH_FIELDS = %w[
    email
    last_visited_at
    referrer
    pro
    role
    plan
    state
    ip
    city
    region
    country
    postal
    web_sessions
    timezone
    browser
    browser_version
    os
    os_version
    browser_language
    lang
  ].freeze

  # belongs_to :user
  belongs_to :app
  has_many :conversations, foreign_key: :main_participant_id, dependent: :destroy
  # has_many :metrics , as: :trackable
  has_many :metrics
  has_many :visits

  include Eventable

  after_create :add_created_event

  after_save :enqueue_social_enrichment, if: :saved_change_to_email?

  store_accessor :properties, [
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
    :job_title
  ]

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
      transitions from: %i[subscribed passive archived blocked], to: :unsubscribed
    end

    event :block do
      transitions from: %i[archived subscribed unsubscribed], to: :blocked
    end

    event :archive do
      transitions from: %i[blocked subscribed unsubscribed], to: :archived
    end
  end

  def delay_for_trigger
    settings = is_a?(AppUser) ? app.user_tasks_settings : app.lead_tasks_settings
    delay = settings['delay'] ? 2.minutes.from_now : 0.minutes.from_now
  end

  def available?
    %w[passive subscribed].include?(subscription_state)
  end

  def add_created_event
    events.log(action: :user_created)
  end

  def add_email_changed_event
    events.log(action: :email_changed)
  end

  def lead_event
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
      unless app.app_users.where(session_id: random_token).any?
        break random_token
      end
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
    puts 'Pending'
  end

  def notify_subscription
    # we should only unsubscribe when process is made from interface, not from sns notification
    puts 'Pending'
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
    return "https://api.adorable.io/avatars/130/#{id}.png?" if email.blank?

    email_address = email.downcase
    hash = Digest::MD5.hexdigest(email_address)
    d = "https://api.adorable.io/avatars/130/#{hash}.png"
    image_src = "https://www.gravatar.com/avatar/#{hash}?d=#{d}"
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
    add_email_changed_event
  end

  def register_visit(options)
    self.visits.register(options, app.register_visits)
  end
end
