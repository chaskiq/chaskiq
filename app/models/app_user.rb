require 'URLcrypt'

class AppUser < ApplicationRecord
  include AASM
  include UnionScope

  belongs_to :user
  belongs_to :app
  has_many :metrics , as: :trackable
  store_accessor :properties, [ :name, :first_name, :last_name, :country ]
  scope :availables, ->{ 
    where(["app_users.subscription_state =? or app_users.subscription_state=?", 
      "passive", "subscribed"]) 
  }

  delegate :email, to: :user

  def as_json(options = nil)
    super({ methods: [:email] }.merge(options || {}))
  end

  def offline?
    !self.state || self.state == "offline" 
  end

  def online?
    self.state == "online"
  end

  def channel_key
    "presence:#{self.app.key}-#{self.user.email}"
  end

  def online!
    self.state = "online"
    self.last_visited_at = Time.now

    if self.save
      ActionCable.server.broadcast(channel_key, self.to_json)
      ActionCable.server.broadcast("events:#{app.key}", formatted_user)
    end
  end

  def offline!
    self.state = "offline"
    self.save
    ActionCable.server.broadcast("events:#{app.key}", formatted_user)
  end

  aasm :column => :subscription_state do # default column: aasm_state
    state :passive, :initial => true
    state :subscribed, :after_enter => :notify_subscription
    state :unsubscribed, :after_enter => :notify_unsubscription
    #state :bounced, :after_enter => :make_bounced
    #state :complained, :after_enter => :make_complained

    event :subscribe do
      transitions :from => [:passive, :unsubscribed], :to => :subscribed
    end

    event :unsubscribe do
      transitions :from => [:subscribed, :passive], :to => :unsubscribed
    end
  end

  def formatted_user

    { email: user.email,
      properties: properties,
      state: state
    }.to_json

  end

  def notify_unsubscription
    puts "Pending"
  end

  def notify_subscription
    #we should only unsubscribe when process is made from interface, not from sns notification
    puts "Pending"
  end

  %w[click open bounce spam].each do |action|
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

end
