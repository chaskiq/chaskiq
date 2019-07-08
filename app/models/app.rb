class App < ApplicationRecord
  include Tokenable

  store :preferences, accessors: [ 
  #  :notifications, 
  #  :gather_data, 
  #  :test_app,
  #  :assigment_rules,
  ], coder: JSON

  # http://nandovieira.com/using-postgresql-and-jsonb-with-ruby-on-rails
  # App.where('preferences @> ?', {notifications: true}.to_json)

  has_many :app_users
  #has_many :users, through: :app_users
  has_many :conversations
  has_many :segments

  has_many :roles
  has_many :agents, through: :roles
  has_many :campaigns
  has_many :user_auto_messages
  has_many :tours
  has_many :messages

  has_many :assignment_rules

  store_accessor :preferences, [
    :active_messenger, 
    :domain_url, 
    :tagline ,
    :theme,
    :notifications,
    :gather_data, 
    :test_app,
    :assigment_rules,
  ]

  def encryption_enabled?
    self.encryption_key.present?
  end

  def config_fields
    [
      { 
        name: "name", 
        type: 'string', 
        grid: {xs: 12, sm: 12} 
      },
      
      {
        name: "domainUrl", 
        type: 'string', 
        grid: {xs: 12, sm: 6 } 
      },

      {
        name: "state", 
        type: "select", 
        grid: {xs: 12, sm: 6 } , 
        options: ["enabled", "disabled" ]
      },

      { name: "activeMessenger", 
        type: 'bool', 
        grid: {xs: 12, sm: 6 } 
      },

      { 
        name: "theme", 
        type: "select", 
        options: ["dark", "light"],
        grid: {xs: 12, sm: 6 }
      },

      {
        name: "encryptionKey", 
        type: 'string', 
        maxLength: 16, minLength: 16, 
        placeholder: "leave it blank for no encryption",
        grid: {xs: 12, sm: 12 } 
      },

      { name: "tagline", 
        type: 'text', 
        hint: "messenger text on botton",
        grid: {xs: 12, sm: 12 } 
      },

    ]
  end

  def triggers
    Trigger.definition
  end

  def add_anonymous_user(attrs)
    session_id = attrs.delete(:session_id)

    # todo : should lock table here ? or ..
    # https://www.postgresql.org/docs/9.3/sql-createsequence.html
    next_id = self.app_users.visitors.size + 1 #self.app_users.visitors.maximum("id").to_i + 1
    
    attrs.merge!(name: "visitor #{next_id}")

    ap = app_users.find_or_initialize_by(session_id: session_id)
    ap.type = "Lead"
    
    data = attrs.deep_merge!(properties: ap.properties)
    ap.assign_attributes(data)
    ap.generate_token
    ap.save
    ap
  end

  def add_user(attrs)
    email = attrs.delete(:email)
    #page_url = attrs.delete(:page_url)
    ap = app_users.find_or_initialize_by(email: email)
    data = attrs.deep_merge!(properties: ap.properties)
    ap.assign_attributes(data)
    ap.last_visited_at = Time.now
    ap.subscribe! unless ap.subscribed?
    ap.save
    #ap.save_page_visit(page_url)
    ap
  end

  def add_agent(attrs)

    email = attrs.delete(:email)
    user = Agent.find_or_initialize_by(email: email)
    #user.skip_confirmation!
    if user.new_record?
      user.password = Devise.friendly_token[0,20]
      user.save
    end

    role = roles.find_or_initialize_by(agent_id: user.id)
    data = attrs.deep_merge!(properties: user.properties)
    
    user.assign_attributes(data)
    user.save

    #role.last_visited_at = Time.now
    role.save
    role

  end

  def add_admin(user)
    user.roles.create(app: self, role: "admin")
    self.add_user(email: user.email)
  end

  def add_visit(opts={})
    add_user(opts)
  end

  def start_conversation(options)
    message = options[:message]
    user = options[:from]
    participant = options[:participant] || user
    message_source = options[:message_source]
    conversation = self.conversations.create({
      main_participant: participant,
      initiator: user
    })
    conversation.add_message(
      from: user,
      message: message,
      message_source: message_source,
      check_assignment_rules: true
    )
    conversation
  end
end