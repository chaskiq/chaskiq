require 'URLcrypt'

class AppUser < ApplicationRecord
  include AASM
  include UnionScope
  include Tokenable

  ENABLED_SEARCH_FIELDS = [
                            "email",
                            "last_visited_at",
                            "referrer",
                            "pro",
                            "role",
                            "plan",
                            "state",
                            "ip",
                            "city",
                            "region",
                            "country",
                            "postal",
                            "web_sessions",
                            "timezone",
                            "browser",
                            "browser_version",
                            "os",
                            "os_version",
                            "browser_language",
                            "lang"
                          ]

  #belongs_to :user
  belongs_to :app
  has_many :conversations, foreign_key: :main_participant_id, dependent: :destroy
  has_many :metrics , as: :trackable
  has_many :visits

  include Eventable

  after_create :add_created_event

  store_accessor :properties, [ 
    :name, 
    :first_name, 
    :last_name, 
    :country, 
    :country_code, 
    :region, 
    :region_code
  ]
  
  scope :availables, ->{ 
    where(["app_users.subscription_state =? or app_users.subscription_state=?", 
      "passive", "subscribed"]) 
  }

  scope :visitors, ->{
    where(type: "Lead")
  }

  scope :users, ->{
    where(type: "User")
  }

  def add_created_event
    self.events.log(action: :user_created)
  end

  def display_name
    [self.name,
    self.email].join(" ")
  end


  def generate_token
    self.session_id = loop do
      random_token = SecureRandom.urlsafe_base64(nil, false)
      break random_token unless app.app_users.where(session_id: random_token).any?
    end
  end

  #delegate :email, to: :user

  def as_json(options = nil)
    super({ only: [:email, :id, :kind, :display_name] , 
      methods: [:email, :id, :kind, :display_name] }.merge(options || {}))
  end

  def offline?
    !self.state || self.state == "offline" 
  end

  def online?
    self.state == "online"
  end

  def channel_key
    "presence:#{self.app.key}-#{self.email}"
  end

  def online!
    self.state = "online"
    self.last_visited_at = Time.now

    if self.save
      ActionCable.server.broadcast(channel_key, self.to_json) #not necessary
      ActionCable.server.broadcast("events:#{app.key}", 
        { type: "presence", 
          data: formatted_user 
        })
    end
  end

  def offline!
    self.state = "offline"
    if self.save
      ActionCable.server.broadcast("events:#{app.key}", 
        { type: "presence", 
          data:  formatted_user 
        })
    end
  end

  aasm :column => :subscription_state do # default column: aasm_state
    state :passive, :initial => true
    state :subscribed, :after_enter => :notify_subscription
    state :unsubscribed, :after_enter => :notify_unsubscription
    state :archived #, after_enter: :notify_archived
    state :blocked #, after_enter: :notify_bloqued
    
    event :subscribe do
      transitions from: [:passive, :unsubscribed, :archived, :blocked], to: :subscribed
    end

    event :unsubscribe do
      transitions from: [:subscribed, :passive, :archived, :blocked], to: :unsubscribed
    end

    event :block do
      transitions from: [:archived, :subscribed, :unsubscribed ], to: :blocked
    end

    event :archive do
      transitions from: [:blocked, :subscribed, :unsubscribed ], to: :archived
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
    puts "Pending"
  end

  def notify_subscription
    #we should only unsubscribe when process is made from interface, not from sns notification
    puts "Pending"
  end

  %w[open send delivery reject bounce complaint click close].each do |action|
    define_method("track_#{action}") do |opts|
      m = self.metrics.new
      m.assign_attributes(opts)
      m.action = action
      m.save
    end
  end

  def encoded_id
    URLcrypt.encode(self.email)
  end

  def decoded_id
    URLcrypt.decode(self.email)
  end

  def kind
    self.class.model_name.singular
  end

  def style_class
    case self.state
    when "passive"
      "plain"
    when "subscribed"
      "information"
    when "unsusbscribed"
      "warning"
    end
  end

  def save_page_visit(url)
    self.visits.create(url: url)
  end

end
